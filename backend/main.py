"""
De Passagem + Foz Conecta — MVP Backend
FastAPI com fallback para Python puro.
"""
from __future__ import annotations
from dataclasses import asdict, dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import uuid4

APP_NAME = "De Passagem"
DEFAULT_CITY = "Alagoinhas/BA"
SECOND_CITY = "Foz do Iguaçu/PR"
PUBLIC_FARE_REFERENCE = 4.60
SOLO_BASE_FARE = 12.00
SHARED_MIN_OCCUPANTS = 4
MAX_SHARED_SEATS = 7
DATABASE_URL = "sqlite:///de_passagem_mvp.db"

try:
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel, Field as PydanticField
    from sqlmodel import Field as SQLField, SQLModel, Session, create_engine, select
    HAS_FASTAPI_STACK = True
except ModuleNotFoundError:
    HAS_FASTAPI_STACK = False
    class HTTPException(Exception):
        def __init__(self, status_code: int, detail: str):
            super().__init__(detail)
            self.status_code = status_code
            self.detail = detail

class UserRole(str, Enum):
    PASSENGER = "passenger"
    DRIVER = "driver"
    SCHOOL_ADMIN = "school_admin"
    RESPONSIBLE = "responsible"
    LODGING_PARTNER = "lodging_partner"
    ADMIN = "admin"

class DriverStatus(str, Enum):
    OFFLINE = "offline"
    AVAILABLE = "available"
    SCHOOL_MODE = "school_mode"
    SHARED_CITY = "shared_city"
    GOING_HOME = "going_home"
    TERMINAL_MODE = "terminal_mode"

class NeighborhoodProfile(str, Enum):
    STANDARD = "standard"
    COMFORT = "comfort"
    CONTROLLED_ACCESS = "controlled_access"
    OPERATIONAL_RISK = "operational_risk"
    EDUCATIONAL = "educational"

class RideType(str, Enum):
    SOLO = "solo"
    SHARED_CITY = "shared_city"
    SCHOOL = "school"
    WORK_GROUP = "work_group"
    STATE_TRIP = "state_trip"
    TERMINAL_TRANSFER = "terminal_transfer"

class BookingStatus(str, Enum):
    REQUESTED = "requested"
    OFFERED = "offered"
    CONFIRMED = "confirmed"
    CHECKED_IN = "checked_in"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class StudentReleaseStatus(str, Enum):
    INSIDE_SCHOOL = "inside_school"
    DRIVER_NOTIFIED = "driver_notified"
    RELEASED_TO_BOARD = "released_to_board"
    BOARDED = "boarded"
    DELIVERED = "delivered"
    INCIDENT = "incident"

class SafetyEventType(str, Enum):
    SOS = "sos"
    ROUTE_DEVIATION = "route_deviation"
    APP_TURNED_OFF = "app_turned_off"
    PIN_FAILED = "pin_failed"
    COMPLAINT = "complaint"

class MatchingPriority(str, Enum):
    FASTEST = "fastest"
    CHEAPEST = "cheapest"
    COMFORT = "comfort"
    SCHOOL_SAFE = "school_safe"

@dataclass
class PlainUser:
    name: str
    phone: str
    role: UserRole
    city: str = DEFAULT_CITY
    email: Optional[str] = None
    id: str = field(default_factory=lambda: str(uuid4()))
    active: bool = True
    created_at: datetime = field(default_factory=datetime.utcnow)

@dataclass
class PlainDriver:
    user_id: str
    vehicle_model: str
    vehicle_plate: str
    seats_available: int = 4
    id: str = field(default_factory=lambda: str(uuid4()))
    approved_for_school: bool = False
    approved_for_terminal: bool = False
    cnh_validated: bool = False
    background_checked: bool = False
    face_validated: bool = False
    status: DriverStatus = DriverStatus.OFFLINE
    app_online: bool = False
    safety_score: int = 100

@dataclass
class PlainNeighborhoodZone:
    name: str
    city: str
    profile: NeighborhoodProfile
    zip_code_prefix: str
    risk_multiplier: float = 1.0
    comfort_required: bool = False
    shared_enabled: bool = True
    night_operation_extra: float = 0.0
    notes: Optional[str] = None
    id: str = field(default_factory=lambda: str(uuid4()))

@dataclass
class PlainRide:
    passenger_user_id: str
    ride_type: RideType
    origin_neighborhood: str
    destination_neighborhood: str
    distance_km: float
    id: str = field(default_factory=lambda: str(uuid4()))
    occupants_expected: int = 1
    accepts_sharing: bool = False
    goes_beyond_center: bool = False
    price_per_passenger: float = 0.0
    total_trip_price: float = 0.0
    technology_fee_total: float = 2.50
    municipal_fee_total: float = 1.00
    created_at: datetime = field(default_factory=datetime.utcnow)
    matching_priority: MatchingPriority = MatchingPriority.CHEAPEST
    assigned_driver_id: Optional[str] = None
    estimated_wait_minutes: int = 0

@dataclass
class PlainLodgingPartner:
    name: str
    city: str
    neighborhood: str
    partner_type: str
    base_rest_price: float
    base_overnight_price: float
    id: str = field(default_factory=lambda: str(uuid4()))
    active: bool = True
    safety_validated: bool = False

@dataclass
class PlainRestBooking:
    passenger_user_id: str
    lodging_partner_id: str
    origin_terminal: str
    final_destination: str
    arrival_time: str
    rest_hours: int
    id: str = field(default_factory=lambda: str(uuid4()))
    status: BookingStatus = BookingStatus.REQUESTED
    estimated_price: float = 0.0
    includes_transfer: bool = True
    created_at: datetime = field(default_factory=datetime.utcnow)

@dataclass
class PlainSafetyEvent:
    event_type: SafetyEventType
    description: str
    id: str = field(default_factory=lambda: str(uuid4()))
    driver_id: Optional[str] = None
    ride_id: Optional[str] = None
    severity: int = 1
    resolved: bool = False
    created_at: datetime = field(default_factory=datetime.utcnow)

class MemoryStore:
    def __init__(self) -> None:
        self.users: Dict[str, PlainUser] = {}
        self.drivers: Dict[str, PlainDriver] = {}
        self.zones: Dict[str, PlainNeighborhoodZone] = {}
        self.rides: Dict[str, PlainRide] = {}
        self.lodging_partners: Dict[str, PlainLodgingPartner] = {}
        self.rest_bookings: Dict[str, PlainRestBooking] = {}
        self.safety_events: Dict[str, PlainSafetyEvent] = {}
        self.pending_matching_queue: List[PlainRide] = []

store = MemoryStore()

def round_money(value: float) -> float:
    return round(value + 1e-9, 2)

def smart_round_fare(value: float, distance_km: float, operational_multiplier: float = 1.0) -> float:
    if value <= 6:
        step = 0.10
    elif value <= 12:
        step = 0.20
    elif value <= 25:
        step = 0.50
    else:
        step = 1.00
    if operational_multiplier >= 1.30 or distance_km >= 15:
        step = max(step, 0.50)
    return round_money(max(step, round(value / step) * step))

def seed_alagoinhas_zones() -> None:
    if store.zones:
        return
    zones = [
        PlainNeighborhoodZone("Brisas do Catu", DEFAULT_CITY, NeighborhoodProfile.COMFORT, "48000", 1.10, True, notes="Zona comfort territorial"),
        PlainNeighborhoodZone("Urupiara", DEFAULT_CITY, NeighborhoodProfile.STANDARD, "48001"),
        PlainNeighborhoodZone("Céu Azul", DEFAULT_CITY, NeighborhoodProfile.OPERATIONAL_RISK, "48002", 1.35, True, night_operation_extra=4.0, notes="Operação assistida"),
        PlainNeighborhoodZone("Informa", DEFAULT_CITY, NeighborhoodProfile.OPERATIONAL_RISK, "48003", 1.30, True, night_operation_extra=3.5, notes="Operação assistida"),
    ]
    for zone in zones:
        store.zones[zone.id] = zone

def find_zone_by_name(name: Optional[str]) -> Optional[PlainNeighborhoodZone]:
    normalized = (name or "").strip().lower()
    for zone in store.zones.values():
        if zone.name.strip().lower() == normalized:
            return zone
    return None

def estimate_wait_time(distance_km: float, occupants: int) -> int:
    wait = 3
    if occupants >= 4:
        wait += 4
    if distance_km >= 10:
        wait += 3
    return min(15, wait)

def determine_matching_priority(comfort_required: bool, occupants: int) -> MatchingPriority:
    if comfort_required:
        return MatchingPriority.COMFORT
    if occupants >= 4:
        return MatchingPriority.CHEAPEST
    return MatchingPriority.FASTEST

def calculate_city_ride_price(distance_km: float, occupants_input: int, goes_beyond_center: bool, origin_zone_name: Optional[str] = None, destination_zone_name: Optional[str] = None) -> Dict[str, Any]:
    seed_alagoinhas_zones()
    occupants = max(1, min(MAX_SHARED_SEATS, int(occupants_input or 1)))
    safe_distance = max(0.1, float(distance_km or 0.1))
    solo_base = max(SOLO_BASE_FARE, safe_distance * 2.8 + 5.0)
    technology_fee_total = 2.50
    municipal_fee_total = 1.00
    trip_fees = technology_fee_total + municipal_fee_total
    zones = [find_zone_by_name(origin_zone_name), find_zone_by_name(destination_zone_name)]
    operational_multiplier = 1.0
    comfort_required = False
    operational_note = ""
    for zone in zones:
        if zone:
            operational_multiplier = max(operational_multiplier, zone.risk_multiplier)
            comfort_required = comfort_required or zone.comfort_required
            if zone.profile == NeighborhoodProfile.OPERATIONAL_RISK:
                operational_note = "Área com operação controlada e reforço de segurança"
                trip_fees += zone.night_operation_extra
    if occupants >= SHARED_MIN_OCCUPANTS:
        additional_km = (safe_distance - 5) * 0.65 if safe_distance > 5 else 0.0
        beyond_center_fee = safe_distance * 0.45 if goes_beyond_center else 0.0
        price_per_passenger = PUBLIC_FARE_REFERENCE + additional_km + beyond_center_fee + trip_fees / occupants
        mode = "lotacao_popular"
    elif occupants == 3:
        price_per_passenger = ((solo_base * 0.68) + trip_fees) / occupants
        mode = "compartilhada_parcial"
    elif occupants == 2:
        price_per_passenger = ((solo_base * 0.78) + trip_fees) / occupants
        mode = "compartilhada_parcial"
    else:
        price_per_passenger = solo_base + trip_fees
        mode = "solo"
    price_per_passenger = smart_round_fare(price_per_passenger * operational_multiplier, safe_distance, operational_multiplier)
    if comfort_required and occupants >= 4:
        mode = "shared_comfort"
    priority = determine_matching_priority(comfort_required, occupants)
    return {
        "pricing_policy": "sem_dinamica",
        "mode": mode,
        "price_per_passenger": round_money(price_per_passenger),
        "total_trip_price": round_money(price_per_passenger * occupants),
        "technology_fee_total": technology_fee_total,
        "municipal_fee_total": municipal_fee_total,
        "operational_multiplier": operational_multiplier,
        "comfort_required": comfort_required,
        "operational_note": operational_note,
        "occupants": occupants,
        "estimated_wait_minutes": estimate_wait_time(safe_distance, occupants),
        "matching_priority": priority.value,
    }

def calculate_return_fee(distance_km: float, app_online: bool) -> float:
    if not app_online:
        return 0.0
    return round_money(max(3.0, distance_km * 0.45))

def calculate_rest_booking_price(rest_hours: int, base_rest_price: float, includes_transfer: bool) -> float:
    hours = max(1, min(12, int(rest_hours or 1)))
    rest_total = base_rest_price * max(1, hours / 3)
    transfer_fee = 18.0 if includes_transfer else 0.0
    platform_fee = 4.0
    return round_money(rest_total + transfer_fee + platform_fee)

def can_release_student_to_board(driver_eta_minutes: Optional[int]) -> bool:
    return isinstance(driver_eta_minutes, int) and driver_eta_minutes <= 3

def register_driver_app_shutdown(driver_id: str, reason: str = "App desligado durante retorno") -> PlainSafetyEvent:
    event = PlainSafetyEvent(SafetyEventType.APP_TURNED_OFF, reason, driver_id=driver_id, severity=3)
    store.safety_events[event.id] = event
    driver = store.drivers.get(driver_id)
    if driver:
        driver.safety_score = max(0, driver.safety_score - 15)
        driver.app_online = False
    return event

def create_ride_request(passenger_user_id: str, ride_type: RideType, origin_neighborhood: str, destination_neighborhood: str, distance_km: float, occupants_expected: int, accepts_sharing: bool, goes_beyond_center: bool = False) -> PlainRide:
    pricing = calculate_city_ride_price(distance_km, occupants_expected, goes_beyond_center, origin_neighborhood, destination_neighborhood)
    ride = PlainRide(
        passenger_user_id=passenger_user_id,
        ride_type=ride_type,
        origin_neighborhood=origin_neighborhood,
        destination_neighborhood=destination_neighborhood,
        distance_km=distance_km,
        occupants_expected=pricing["occupants"],
        accepts_sharing=accepts_sharing,
        goes_beyond_center=goes_beyond_center,
        price_per_passenger=pricing["price_per_passenger"],
        total_trip_price=pricing["total_trip_price"],
        estimated_wait_minutes=pricing["estimated_wait_minutes"],
        matching_priority=MatchingPriority(pricing["matching_priority"]),
    )
    store.rides[ride.id] = ride
    store.pending_matching_queue.append(ride)
    return ride

def match_driver_to_ride(ride_id: str) -> Dict[str, Any]:
    ride = store.rides.get(ride_id)
    if not ride:
        raise ValueError("Ride not found")
    available_drivers = [d for d in store.drivers.values() if d.app_online and d.status != DriverStatus.OFFLINE]
    if not available_drivers:
        return {"matched": False, "reason": "Nenhum motorista disponível", "estimated_wait_minutes": ride.estimated_wait_minutes}
    selected = sorted(available_drivers, key=lambda d: (-d.safety_score, -d.seats_available))[0]
    ride.assigned_driver_id = selected.id
    return {"matched": True, "driver_id": selected.id, "vehicle": selected.vehicle_model, "estimated_wait_minutes": ride.estimated_wait_minutes, "matching_priority": ride.matching_priority.value}

def serialize(value: Any) -> Any:
    if isinstance(value, Enum):
        return value.value
    if isinstance(value, datetime):
        return value.isoformat()
    if hasattr(value, "__dataclass_fields__"):
        return {k: serialize(v) for k, v in asdict(value).items()}
    if isinstance(value, list):
        return [serialize(v) for v in value]
    if isinstance(value, dict):
        return {k: serialize(v) for k, v in value.items()}
    return value

def create_demo_data() -> Dict[str, Any]:
    store.__init__()
    seed_alagoinhas_zones()
    passenger = PlainUser("Passageira de Brasília", "61999990000", UserRole.PASSENGER, city=SECOND_CITY)
    driver_user = PlainUser("Motorista Fernanda", "45999990000", UserRole.DRIVER, city=SECOND_CITY)
    driver = PlainDriver(driver_user.id, "Spin 7 lugares", "FOZ1A23", 7, True, True, True, True, True, DriverStatus.TERMINAL_MODE, True)
    lodging = PlainLodgingPartner("Pouso Seguro Foz", SECOND_CITY, "Centro", "hotel/parceiro", 35.0, 120.0, safety_validated=True)
    for item in [passenger, driver_user]:
        store.users[item.id] = item
    store.drivers[driver.id] = driver
    store.lodging_partners[lodging.id] = lodging
    booking_price = calculate_rest_booking_price(6, lodging.base_rest_price, True)
    booking = PlainRestBooking(passenger.id, lodging.id, "Rodoviária de Foz", "Destino final pela manhã", "02:20", 6, status=BookingStatus.OFFERED, estimated_price=booking_price)
    store.rest_bookings[booking.id] = booking
    ride = create_ride_request(passenger.id, RideType.TERMINAL_TRANSFER, "Rodoviária", "Centro", 7, 4, True, False)
    matched = match_driver_to_ride(ride.id)
    ride.total_trip_price = round_money(ride.total_trip_price + calculate_return_fee(7, True))
    return serialize({"summary": {"city": SECOND_CITY, "users": len(store.users), "drivers": len(store.drivers), "lodging_partners": len(store.lodging_partners), "bookings": len(store.rest_bookings), "rides": len(store.rides), "zones": len(store.zones)}, "booking": booking, "ride": ride, "matching": matched})

def run_rule_tests() -> Dict[str, Any]:
    seed_alagoinhas_zones()
    solo = calculate_city_ride_price(5, 1, False)
    shared = calculate_city_ride_price(5, 4, False, "Brisas do Catu", "Centro")
    capped = calculate_city_ride_price(5, 99, False)
    beyond = calculate_city_ride_price(5, 4, True, "Céu Azul", "Centro")
    rest = calculate_rest_booking_price(6, 35.0, True)
    tests = [
        {"name": "Arredondamento inteligente elimina valores quebrados", "passed": smart_round_fare(6.37, 5) in [6.4, 6.5, 6.0], "detail": {"rounded": smart_round_fare(6.37, 5)}},
        {"name": "Corrida solo usa modo solo", "passed": solo["mode"] == "solo" and solo["occupants"] == 1, "detail": solo},
        {"name": "Com 4 ocupantes ativa compartilhamento", "passed": shared["mode"] in ["lotacao_popular", "shared_comfort"] and shared["price_per_passenger"] < solo["price_per_passenger"], "detail": {"solo": solo, "shared": shared}},
        {"name": "Lotação máxima limitada a 7", "passed": capped["occupants"] == MAX_SHARED_SEATS, "detail": capped},
        {"name": "Além do centro aumenta valor proporcional", "passed": beyond["price_per_passenger"] > shared["price_per_passenger"], "detail": {"center": shared, "beyond": beyond}},
        {"name": "Aluno só libera com motorista até 3 minutos", "passed": can_release_student_to_board(3) and not can_release_student_to_board(4), "detail": {"eta_3": True, "eta_4": False}},
        {"name": "Descanso em Foz gera preço positivo", "passed": rest > 0, "detail": {"rest_booking_price": rest}},
        {"name": "Taxa de retorno só existe com app online", "passed": calculate_return_fee(10, True) > 0 and calculate_return_fee(10, False) == 0, "detail": {"online": calculate_return_fee(10, True), "offline": calculate_return_fee(10, False)}},
        {"name": "Desligar app gera evento antifraude", "passed": register_driver_app_shutdown("driver-test").event_type == SafetyEventType.APP_TURNED_OFF, "detail": {"event": "created"}},
        {"name": "Bairros operacionais possuem multiplicador", "passed": beyond["operational_multiplier"] > 1.0, "detail": beyond},
        {"name": "Matching define prioridade", "passed": shared["matching_priority"] in ["comfort", "cheapest", "fastest"], "detail": shared},
    ]
    return {"passed": len([t for t in tests if t["passed"]]), "total": len(tests), "tests": tests}

if HAS_FASTAPI_STACK:
    engine = create_engine(DATABASE_URL, echo=False)
    app = FastAPI(title=f"{APP_NAME} API", version="0.3.0")
    app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

    class User(SQLModel, table=True):
        id: str = SQLField(default_factory=lambda: str(uuid4()), primary_key=True)
        name: str
        phone: str
        role: UserRole
        city: str = DEFAULT_CITY
        email: Optional[str] = None
        active: bool = True
        created_at: datetime = SQLField(default_factory=datetime.utcnow)

    class LodgingPartner(SQLModel, table=True):
        id: str = SQLField(default_factory=lambda: str(uuid4()), primary_key=True)
        name: str
        city: str
        neighborhood: str
        partner_type: str
        base_rest_price: float
        base_overnight_price: float
        active: bool = True
        safety_validated: bool = False

    class RestBooking(SQLModel, table=True):
        id: str = SQLField(default_factory=lambda: str(uuid4()), primary_key=True)
        passenger_user_id: str
        lodging_partner_id: str
        origin_terminal: str
        final_destination: str
        arrival_time: str
        rest_hours: int
        status: BookingStatus = BookingStatus.REQUESTED
        estimated_price: float = 0.0
        includes_transfer: bool = True
        created_at: datetime = SQLField(default_factory=datetime.utcnow)

    class CreateUserRequest(BaseModel):
        name: str
        phone: str
        role: UserRole
        city: str = DEFAULT_CITY
        email: Optional[str] = None

    class CreateLodgingPartnerRequest(BaseModel):
        name: str
        city: str = SECOND_CITY
        neighborhood: str
        partner_type: str = "hotel/parceiro"
        base_rest_price: float = PydanticField(gt=0)
        base_overnight_price: float = PydanticField(gt=0)

    class CreateRestBookingRequest(BaseModel):
        passenger_user_id: str
        lodging_partner_id: str
        origin_terminal: str = "Rodoviária de Foz"
        final_destination: str
        arrival_time: str
        rest_hours: int = PydanticField(ge=1, le=12)
        includes_transfer: bool = True

    @app.on_event("startup")
    def on_startup() -> None:
        SQLModel.metadata.create_all(engine)
        seed_alagoinhas_zones()

    @app.get("/")
    def root() -> Dict[str, Any]:
        return {"app": APP_NAME, "operation_mode": "territorial_shared_mobility", "pricing_policy": "sem_dinamica", "modules": ["mobilidade", "area_escolar", "foz_descanso"], "docs": "/docs"}

    @app.get("/health")
    def health() -> Dict[str, Any]:
        return {"ok": True, "timestamp": datetime.utcnow().isoformat()}

    @app.get("/tests/rules")
    def api_tests() -> Dict[str, Any]:
        return run_rule_tests()

    @app.get("/pricing/city-ride")
    def pricing_city_ride(distance_km: float, occupants: int = 1, goes_beyond_center: bool = False, origin_zone: Optional[str] = None, destination_zone: Optional[str] = None) -> Dict[str, Any]:
        return calculate_city_ride_price(distance_km, occupants, goes_beyond_center, origin_zone, destination_zone)

    @app.get("/pricing/return-fee")
    def pricing_return_fee(distance_km: float, app_online: bool = True) -> Dict[str, Any]:
        return {"return_fee": calculate_return_fee(distance_km, app_online)}

    @app.post("/drivers/{driver_id}/shutdown-alert")
    def shutdown_alert(driver_id: str) -> Dict[str, Any]:
        return serialize(register_driver_app_shutdown(driver_id))

    @app.get("/demo/foz")
    def demo_foz() -> Dict[str, Any]:
        return create_demo_data()

    @app.post("/demo/seed-driver")
    def seed_driver() -> Dict[str, Any]:
        user = PlainUser("Motorista Demo", "75999990000", UserRole.DRIVER)
        driver = PlainDriver(user.id, "Spin 7 lugares", "DEMO123", 7, True, True, True, True, True, DriverStatus.AVAILABLE, True)
        store.users[user.id] = user
        store.drivers[driver.id] = driver
        return serialize({"user": user, "driver": driver})

    @app.post("/rides/create")
    def create_ride(passenger_user_id: str, ride_type: RideType, origin_neighborhood: str, destination_neighborhood: str, distance_km: float, occupants_expected: int, accepts_sharing: bool, goes_beyond_center: bool = False) -> Dict[str, Any]:
        ride = create_ride_request(passenger_user_id, ride_type, origin_neighborhood, destination_neighborhood, distance_km, occupants_expected, accepts_sharing, goes_beyond_center)
        return serialize(ride)

    @app.post("/rides/{ride_id}/match")
    def match_ride(ride_id: str) -> Dict[str, Any]:
        return match_driver_to_ride(ride_id)

    @app.post("/users", response_model=User)
    def create_user(payload: CreateUserRequest) -> User:
        user = User(**payload.model_dump())
        with Session(engine) as session:
            session.add(user); session.commit(); session.refresh(user); return user

    @app.get("/users", response_model=List[User])
    def list_users() -> List[User]:
        with Session(engine) as session:
            return list(session.exec(select(User)).all())

    @app.post("/lodging-partners", response_model=LodgingPartner)
    def create_lodging_partner(payload: CreateLodgingPartnerRequest) -> LodgingPartner:
        partner = LodgingPartner(**payload.model_dump(), safety_validated=True)
        with Session(engine) as session:
            session.add(partner); session.commit(); session.refresh(partner); return partner

    @app.get("/lodging-partners", response_model=List[LodgingPartner])
    def list_lodging_partners(city: Optional[str] = None) -> List[LodgingPartner]:
        with Session(engine) as session:
            query = select(LodgingPartner)
            if city:
                query = query.where(LodgingPartner.city == city)
            return list(session.exec(query).all())

    @app.post("/rest-bookings", response_model=RestBooking)
    def create_rest_booking(payload: CreateRestBookingRequest) -> RestBooking:
        with Session(engine) as session:
            passenger = session.get(User, payload.passenger_user_id)
            partner = session.get(LodgingPartner, payload.lodging_partner_id)
            if not passenger:
                raise HTTPException(status_code=404, detail="Passageiro não encontrado")
            if not partner or not partner.active or not partner.safety_validated:
                raise HTTPException(status_code=400, detail="Hospedagem indisponível ou não validada")
            price = calculate_rest_booking_price(payload.rest_hours, partner.base_rest_price, payload.includes_transfer)
            booking = RestBooking(**payload.model_dump(), estimated_price=price, status=BookingStatus.OFFERED)
            session.add(booking); session.commit(); session.refresh(booking); return booking

    @app.get("/rest-bookings", response_model=List[RestBooking])
    def list_rest_bookings() -> List[RestBooking]:
        with Session(engine) as session:
            return list(session.exec(select(RestBooking)).all())
else:
    app = None

if __name__ == "__main__":
    import json
    print(f"{APP_NAME} — MVP local")
    print("FastAPI disponível" if HAS_FASTAPI_STACK else "FastAPI não instalado; rodando modo Python puro")
    print(json.dumps(run_rule_tests(), indent=2, ensure_ascii=False, default=str))
    print(json.dumps(create_demo_data(), indent=2, ensure_ascii=False, default=str))
