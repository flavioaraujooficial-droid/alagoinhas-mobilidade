import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

// Tabela base de Linhas e Rotas do Hub de Alagoinhas
const ROTAS_ALAGOINHAS_INICIAL = [
  // --- URBANOS, BAIRROS E EMPRESAS (HABILITADOS NO MODO ALAGOINHAS URBAN) ---
  { id: 15, nome: "Rota Corujão Madrugada (Hospital / Atacarejo / Petrolata / Zani Carajás)", categoria: "Urbana", tipo: "Van / Carro Compartilhado", tarifaColetivo: 7.00, tarifaExclusivo: 40.00, pontoEmbarque: "Pontos Agendados de Coleta", vagasObrigatorias: 4, taxaRetornoVazio: 0.00 },
  { id: 1, nome: "Mangalô / Santa Terezinha ↔ Centro", categoria: "Urbana", tipo: "Urbano / Bairro", tarifaColetivo: 4.00, tarifaExclusivo: 25.00, pontoEmbarque: "Qualquer Ponto Central / Bairro", vagasObrigatorias: 1, taxaRetornoVazio: 0.00 },
  { id: 2, nome: "Alagoinhas Velha / Praça Kennedy ↔ Centro", categoria: "Urbana", tipo: "Urbano / Bairro", tarifaColetivo: 4.50, tarifaExclusivo: 25.00, pontoEmbarque: "Praça Kennedy / Centro", vagasObrigatorias: 1, taxaRetornoVazio: 0.00 },
  { id: 5, nome: "Fazenda Catuzinho ↔ Centro", categoria: "Distrital", tipo: "Povoado / Rural", tarifaColetivo: 4.50, tarifaExclusivo: 25.00, pontoEmbarque: "Transbordo / Centro", vagasObrigatorias: 1, taxaRetornoVazio: 8.00 },
  { id: 6, nome: "Boa União ↔ Centro", categoria: "Distrital", tipo: "Povoado / Rural", tarifaColetivo: 5.50, tarifaExclusivo: 30.00, pontoEmbarque: "Transbordo", vagasObrigatorias: 1, taxaRetornoVazio: 10.00 },
  { id: 7, nome: "Estêvão ↔ Centro", categoria: "Distrital", tipo: "Povoado / Rural", tarifaColetivo: 5.00, tarifaExclusivo: 28.00, pontoEmbarque: "Transbordo", vagasObrigatorias: 1, taxaRetornoVazio: 8.00 },
  { id: 8, nome: "Riacho da Guia / Calu ↔ Transbordo", categoria: "Distrital", tipo: "Distrito / Rural", tarifaColetivo: 7.00, tarifaExclusivo: 45.00, pontoEmbarque: "Transbordo", vagasObrigatorias: 1, taxaRetornoVazio: 15.00 },

  // --- INTERMUNICIPAIS / BLOQUEADOS TEMPORARIAMENTE NO TESTE DA CIDADE ---
  { id: 13, nome: "Alagoinhas ↔ Feira de Santana (Ligeirinho Express)", categoria: "Intermunicipal", tipo: "Carro Compartilhado (4 Vagas)", tarifaColetivo: 40.00, tarifaExclusivo: 160.00, pontoEmbarque: "Praça Rui Barbosa / Viaduto / Rodoviária", vagasObrigatorias: 4, taxaRetornoVazio: 30.00 },
  { id: 14, nome: "Alagoinhas ↔ Salvador (Ligeirinho Express)", categoria: "Intermunicipal", tipo: "Carro Compartilhado (4 Vagas)", tarifaColetivo: 50.00, tarifaExclusivo: 200.00, pontoEmbarque: "Praça Rui Barbosa / Viaduto / Rodoviária", vagasObrigatorias: 4, taxaRetornoVazio: 50.00 },
  { id: 9, nome: "Pedrão ↔ Alagoinhas", categoria: "Intermunicipal", tipo: "Regional", tarifaColetivo: 9.00, tarifaExclusivo: 60.00, pontoEmbarque: "Viaduto / Centro", vagasObrigatorias: 1, taxaRetornoVazio: 15.00 },
  { id: 10, nome: "Aramari ↔ Alagoinhas", categoria: "Intermunicipal", tipo: "Regional", tarifaColetivo: 6.00, tarifaExclusivo: 35.00, pontoEmbarque: "Terminal Central", vagasObrigatorias: 1, taxaRetornoVazio: 10.00 }
];

function App() {
  const [abaAtiva, setAbaAtiva] = useState('passageiro');
  const [idRotaSelecionada, setIdRotaSelecionada] = useState(15);
  const [modalidade, setModalidade] = useState('coletivo');
  const [qtdPassageirosPonto, setQtdPassageirosPonto] = useState(1);
  
  // TRAVA GEOGRÁFICA (APENAS URBANOS DE ALAGOINHAS)
  const [modoApenasUrbanoAlagoinhas, setModoApenasUrbanoAlagoinhas] = useState(true);

  // MODO "INDO PARA CASA" (CONDUTOR)
  const [modoIndoParaCasa, setModoIndoParaCasa] = useState(false);
  const [destinoCasa, setDestinoCasa] = useState('Estêvão');

  // SEGURANÇA: CÓDIGO PIN & COMPARTILHAMENTO
  const [codigoPinEmbarque] = useState('8421');
  const [pinDigitadoMotorista, setPinDigitadoMotorista] = useState('');
  const [corridaIniciadaSegura, setCorridaIniciadaSegura] = useState(false);

  // AGENDAMENTO & EMERGÊNCIA
  const [agendamentoAtivo, setAgendamentoAtivo] = useState(true);
  const [alertaEmergenciaRelancado, setAlertaEmergenciaRelancado] = useState(false);

  // AUDITORIA ANTI-FRAUDE
  const [mostrarPesquisaCancelamento, setMostrarPesquisaCancelamento] = useState(true);
  const [respostaFraude, setRespostaFraude] = useState(null);

  // AUTENTICAÇÃO ADM
  const [autenticadoAdm, setAutenticadoAdm] = useState(false);
  const [senhaInput, setSenhaInput] = useState('');

  // PARÂMETROS OPERACIONAIS E ROTAS
  const [taxaPlataforma, setTaxaPlataforma] = useState(10); 
  const [reservaMinimaPassageiro, setReservaMinimaPassageiro] = useState(20.00); 
  const [saldoCarteiraPassageiro, setSaldoCarteiraPassageiro] = useState(25.00); 

  const [rotas, setRotas] = useState(ROTAS_ALAGOINHAS_INICIAL);
  const [novaRota, setNovaRota] = useState({ nome: '', categoria: 'Urbana', tarifaColetivo: 5, tarifaExclusivo: 30, pontoEmbarque: 'Centro', taxaRetornoVazio: 0 });

  // FILTRAGEM DINÂMICA DE ROTAS COM BASE NA TRAVA GEOGRÁFICA
  const rotasExibidas = modoApenasUrbanoAlagoinhas 
    ? rotas.filter(r => r.categoria === "Urbana" || r.categoria === "Distrital" || r.categoria === "Madrugada")
    : rotas;

  const rotaSelecionada = rotasExibidas.find(r => r.id === Number(idRotaSelecionada)) || rotasExibidas[0];

  // CÁLCULOS
  const tarifaUnitaria = modalidade === 'coletivo' ? rotaSelecionada.tarifaColetivo : rotaSelecionada.tarifaExclusivo;
  const valorTotalPague = modalidade === 'coletivo' ? (tarifaUnitaria * qtdPassageirosPonto) : tarifaUnitaria;

  const valorDescontoPlataforma = (valorTotalPague * taxaPlataforma) / 100;
  const valorLiquidoMotorista = valorTotalPague - valorDescontoPlataforma;

  const passageiroAprovado = saldoCarteiraPassageiro >= reservaMinimaPassageiro;

  const atualizarTarifa = (id, campo, novoValor) => {
    const val = parseFloat(novoValor) || 0;
    setRotas(rotas.map(r => r.id === id ? { ...r, [campo]: val } : r));
  };

  const loginAdm = (e) => {
    e.preventDefault();
    if (senhaInput === '1234') {
      setAutenticadoAdm(true);
    } else {
      alert('Senha incorreta! Use: 1234');
    }
  };

  const adicionarNovaRota = (e) => {
    e.preventDefault();
    if (!novaRota.nome) return;
    const novoid = rotas.length > 0 ? Math.max(...rotas.map(r => r.id)) + 1 : 1;
    setRotas([...rotas, { ...novaRota, id: novoid, vagasObrigatorias: 1 }]);
    setNovaRota({ nome: '', categoria: 'Urbana', tarifaColetivo: 5, tarifaExclusivo: 30, pontoEmbarque: 'Centro', taxaRetornoVazio: 0 });
    alert('Nova rota urbana/ponto de empresa adicionado com sucesso!');
  };

  const validarPinMotorista = (e) => {
    e.preventDefault();
    if (pinDigitadoMotorista === codigoPinEmbarque) {
      setCorridaIniciadaSegura(true);
      alert('✓ CÓDIGO CONFIRMADO! Embarque autenticado com sucesso. Boa viagem!');
    } else {
      alert('❌ CÓDIGO INCORRETO! Solicite o PIN de 4 dígitos ao passageiro.');
    }
  };

  const compartilharViagemWhatsApp = () => {
    const texto = encodeURIComponent(`🛡️ Estou em trânsito com a DE PASSAGEM!\nRota: ${rotaSelecionada.nome}\nMotorista Autenticado (PIN: ${codigoPinEmbarque})\nAcompanhe minha viagem em tempo real.`);
    window.open(`https://api.whatsapp.com/send?text=${texto}`, '_blank');
  };

  const cancelarAgendamentoEmergencia = () => {
    setAgendamentoAtivo(false);
    setAlertaEmergenciaRelancado(true);
    alert('Agendamento cancelado. A corrida foi relançada com PRIORIDADE MÁXIMA para os outros motoristas!');
  };

  const responderPesquisaFraude = (opcao) => {
    setRespostaFraude(opcao);
    if (opcao === 'sim_por_fora') {
      setSaldoCarteiraPassageiro(prev => prev + 5.00);
      alert('Obrigado! Bônus de R$ 5,00 adicionado à carteira. O motorista foi auditado.');
    } else {
      alert('Obrigado pelas informações!');
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', padding: '20px' }}>
      
      {/* Cabeçalho de Passagem */}
      <header style={{ borderBottom: '2px solid #f97316', paddingBottom: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ color: '#f97316', margin: 0, fontSize: '28px', fontWeight: '900', letterSpacing: '1px' }}>
            DE PASSAGEM
          </h1>
          <p style={{ color: '#cbd5e1', margin: '3px 0 0 0', fontSize: '13px', fontStyle: 'italic' }}>
            Mobilidade que conecta. Respeito que transforma.
          </p>
        </div>

        {modoApenasUrbanoAlagoinhas ? (
          <span style={{ backgroundColor: '#ea580c', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
            📍 Operação Alagoinhas
          </span>
        ) : (
          <span style={{ backgroundColor: '#0284c7', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
            🌐 Conexão Regional
          </span>
        )}
      </header>

      {/* Navegação de Abas */}
      <nav style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
        <button onClick={() => setAbaAtiva('passageiro')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: abaAtiva === 'passageiro' ? '#f97316' : '#1e293b', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
          📱 Passageiro
        </button>
        <button onClick={() => setAbaAtiva('motorista_painel')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: abaAtiva === 'motorista_painel' ? '#22c55e' : '#1e293b', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
          🚘 Painel do Condutor & Indo para Casa
        </button>
        <button onClick={() => setAbaAtiva('adm')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: abaAtiva === 'adm' ? '#eab308' : '#1e293b', color: abaAtiva === 'adm' ? '#0f172a' : '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
          ⚙️ Painel ADM
        </button>
      </nav>

      {/* ALERTA DE EMERGÊNCIA RELANÇADA */}
      {alertaEmergenciaRelancado && (
        <div style={{ backgroundColor: '#7f1d1d', border: '2px solid #ef4444', padding: '15px', borderRadius: '10px', marginBottom: '20px', color: '#fff' }}>
          <h4 style={{ margin: 0, fontSize: '16px' }}>🚨 AVISO: CORRIDA RELANÇADA COM PRIORIDADE MÁXIMA</h4>
          <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#fca5a5' }}>
            O agendamento para <strong>Santa Terezinha / Centro</strong> foi relançado com prioridade!
          </p>
        </div>
      )}

      {/* BANNER DE AUDITORIA DE CANCELAMENTO PÓS-VIAGEM */}
      {mostrarPesquisaCancelamento && (
        <div style={{ backgroundColor: '#1e1b4b', border: '2px solid #6366f1', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h4 style={{ margin: '0 0 5px 0', color: '#a5b4fc' }}>🔎 Checagem de Segurança Pós-Viagem</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1' }}>
                Sua corrida de madrugada para <strong>Santa Terezinha</strong> foi cancelada. O motorista realizou a viagem por fora do app?
              </p>
            </div>
            <button onClick={() => setMostrarPesquisaCancelamento(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
          </div>

          {!respostaFraude ? (
            <div style={{ marginTop: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => responderPesquisaFraude('sim_por_fora')}
                style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', backgroundColor: '#ef4444', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>
                🚨 Sim, ele fez por fora (+ R$ 5,00 Bônus)
              </button>
              <button 
                onClick={() => responderPesquisaFraude('nao_realizada')}
                style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', fontSize: '12px', cursor: 'pointer' }}>
                Não, a viagem realmente não aconteceu
              </button>
            </div>
          ) : (
            <div style={{ marginTop: '10px', color: '#22c55e', fontSize: '12px', fontWeight: 'bold' }}>
              ✓ Bônus creditado na carteira!
            </div>
          )}
        </div>
      )}

      {/* 1. ABA PASSAGEIRO */}
      {abaAtiva === 'passageiro' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          
          <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
            <h3 style={{ marginTop: 0, color: '#f1f5f9' }}>1. Agendamento & Seleção de Rota</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '5px' }}>
                DESTINOS DISPONÍVEIS ({modoApenasUrbanoAlagoinhas ? 'OPERAÇÃO ALAGOINHAS' : 'TODOS OS DESTINOS'})
              </label>
              <select value={idRotaSelecionada} onChange={(e) => setIdRotaSelecionada(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569' }}>
                {rotasExibidas.map(r => (
                  <option key={r.id} value={r.id}>{r.nome}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '5px' }}>TIPO DE EMBARQUE</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => setModalidade('coletivo')}
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #f97316', backgroundColor: modalidade === 'coletivo' ? '#ea580c' : '#0f172a', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
                  👥 Assento / Vaga
                </button>
                <button 
                  onClick={() => setModalidade('exclusivo')}
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #eab308', backgroundColor: modalidade === 'exclusivo' ? '#ca8a04' : '#0f172a', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
                  🚗 Carro Exclusivo
                </button>
              </div>
            </div>

            {/* SELETOR DE QUANTIDADE DE PASSAGEIROS POR PARADA */}
            {modalidade === 'coletivo' && (
              <div style={{ marginBottom: '15px', backgroundColor: '#0f172a', padding: '12px', borderRadius: '8px', border: '1px solid #f97316' }}>
                <label style={{ display: 'block', color: '#f97316', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>
                  Quantas pessoas vão embarcar nesta parada?
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {[1, 2, 3, 4].map(num => (
                    <button 
                      key={num}
                      onClick={() => setQtdPassageirosPonto(num)}
                      style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: qtdPassageirosPonto === num ? '#ea580c' : '#1e293b', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
                      {num} {num === 1 ? 'Pessoa' : 'Pessoas'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CARD DE PIN DE SEGURANÇA E COMPARTILHAMENTO */}
            <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '10px', marginBottom: '15px', border: '1px solid #f97316' }}>
              <h4 style={{ margin: '0 0 5px 0', color: '#f97316' }}>🔑 Seu Código PIN de Embarque</h4>
              <div style={{ fontSize: '26px', fontWeight: 'bold', letterSpacing: '4px', color: '#22c55e', backgroundColor: '#1e293b', padding: '8px 15px', borderRadius: '8px', display: 'inline-block', marginBottom: '10px' }}>
                {codigoPinEmbarque}
              </div>
              <button 
                onClick={compartilharViagemWhatsApp}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: 'none', backgroundColor: '#25d366', color: '#fff', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                📲 Compartilhar Rota em Tempo Real (WhatsApp)
              </button>
            </div>

            {/* Trava Anti-Calote */}
            <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px', borderLeft: passageiroAprovado ? '4px solid #22c55e' : '4px solid #ef4444' }}>
              <h4 style={{ margin: '0 0 5px 0', color: '#f8fafc' }}>Status da Carteira</h4>
              <p style={{ margin: '3px 0', fontSize: '13px', color: '#cbd5e1' }}>
                Saldo em Conta: <strong>R$ {saldoCarteiraPassageiro.toFixed(2)}</strong> | Reserva Mínima: <strong>R$ {reservaMinimaPassageiro.toFixed(2)}</strong>
              </p>
              
              {passageiroAprovado ? (
                <div style={{ marginTop: '8px', padding: '6px', backgroundColor: '#064e3b', color: '#6ee7b7', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  ✓ SOLICITAÇÃO AUTORIZADA COM GARANTIA
                </div>
              ) : (
                <div style={{ marginTop: '8px', padding: '6px', backgroundColor: '#7f1d1d', color: '#fca5a5', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  ⚠️ SALDO INSUFICIENTE NA RESERVA
                </div>
              )}
            </div>

          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
            <h3 style={{ marginTop: 0, color: '#f1f5f9' }}>2. Detalhamento Financeiro</h3>
            
            <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
              <p style={{ margin: '0 0 5px 0', color: '#f97316', fontWeight: 'bold' }}>{rotaSelecionada.nome}</p>
              <p style={{ margin: '3px 0', fontSize: '13px', color: '#94a3b8' }}>📍 <strong>Ponto de Coleta:</strong> {rotaSelecionada.pontoEmbarque}</p>
              <p style={{ margin: '3px 0', fontSize: '13px', color: '#cbd5e1' }}>👥 <strong>Embarque:</strong> {modalidade === 'coletivo' ? `${qtdPassageirosPonto} pessoa(s)` : 'Carro Exclusivo'}</p>
            </div>

            <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px' }}>
                <span>Valor Total da Parada:</span>
                <strong style={{ color: '#fff' }}>R$ {valorTotalPague.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px', color: '#ef4444' }}>
                <span>Taxa da Plataforma ({taxaPlataforma}%):</span>
                <strong>- R$ {valorDescontoPlataforma.toFixed(2)}</strong>
              </div>
              <hr style={{ borderColor: '#334155', margin: '10px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', color: '#22c55e' }}>
                <span>Líquido do Motorista:</span>
                <strong>R$ {valorLiquidoMotorista.toFixed(2)}</strong>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 2. ABA PAINEL DO CONDUTOR / MODO INDO PARA CASA */}
      {abaAtiva === 'motorista_painel' && (
        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
          <h3 style={{ marginTop: 0, color: '#22c55e' }}>Painel do Condutor</h3>

          {/* MODO "INDO PARA CASA" */}
          <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h4 style={{ margin: 0, color: '#f8fafc' }}>🏠 Modo "Indo para Casa" (Rota Final de Retorno)</h4>
                <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>
                  {modoIndoParaCasa ? `Buscando passageiros no seu trajeto para: ${destinoCasa}` : 'Modo padrão ativo (Atendendo todas as áreas de Alagoinhas)'}
                </p>
              </div>

              <button 
                onClick={() => setModoIndoParaCasa(!modoIndoParaCasa)}
                style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: modoIndoParaCasa ? '#22c55e' : '#475569', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
                {modoIndoParaCasa ? '✓ MODO RETORNO ATIVO' : 'ATIVAR MODO "INDO PARA CASA"'}
              </button>
            </div>

            {modoIndoParaCasa && (
              <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                <label style={{ fontSize: '13px', color: '#f97316', fontWeight: 'bold' }}>SELECIONE SEU DISTRITO / POVOADO DE RESIDÊNCIA:</label>
                <select value={destinoCasa} onChange={(e) => setDestinoCasa(e.target.value)} style={{ padding: '8px', borderRadius: '6px', backgroundColor: '#1e293b', color: '#fff', border: '1px solid #475569', fontWeight: 'bold' }}>
                  <option value="Estêvão">Estêvão</option>
                  <option value="Boa União">Boa União</option>
                  <option value="Fazenda Catuzinho">Fazenda Catuzinho</option>
                  <option value="Riacho da Guia / Calu">Riacho da Guia / Calu</option>
                  <option value="Aramari">Aramari</option>
                  <option value="Pedrão">Pedrão</option>
                  <option value="Santa Terezinha / Mangalô">Santa Terezinha / Mangalô</option>
                </select>
              </div>
            )}
          </div>

          {/* VALIDAÇÃO DE PIN NO EMBARQUE */}
          <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #334155' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#eab308' }}>🔑 Validar PIN de Embarque do Passageiro</h4>
            <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#94a3b8' }}>
              Solicite o código de 4 dígitos ao passageiro para autorizar a partida:
            </p>

            {!corridaIniciadaSegura ? (
              <form onSubmit={validarPinMotorista} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  maxLength="4" 
                  placeholder="Ex: 8421" 
                  value={pinDigitadoMotorista}
                  onChange={(e) => setPinDigitadoMotorista(e.target.value)}
                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#1e293b', color: '#22c55e', fontSize: '18px', fontWeight: 'bold', width: '120px', textAlign: 'center' }}
                  required 
                />
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#22c55e', color: '#0f172a', fontWeight: 'bold', cursor: 'pointer' }}>
                  ✓ Confirmar PIN & Iniciar
                </button>
              </form>
            ) : (
              <div style={{ padding: '12px', backgroundColor: '#064e3b', color: '#6ee7b7', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px' }}>
                ✓ VIAGEM AUTENTICADA COM SUCESSO.
              </div>
            )}
          </div>

          {/* AGENDAMENTO E EMERGÊNCIA */}
          <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '10px', border: '1px solid #334155' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#f97316' }}>📅 Agendamento da Madrugada (Atacarejo / Petrolata / Zani Carajás):</h4>
            
            {agendamentoAtivo ? (
              <div>
                <div style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px', marginBottom: '12px', borderLeft: '4px solid #22c55e' }}>
                  <p style={{ margin: '3px 0', fontSize: '13px', fontWeight: 'bold' }}>Rota: Santa Terezinha / Mangalô ↔ Centro (04:30 AM)</p>
                  <p style={{ margin: '3px 0', fontSize: '12px', color: '#22c55e', fontWeight: 'bold' }}>💰 Faturamento Garantido: R$ 21,00 (Reserva Ativa)</p>
                </div>

                <button 
                  onClick={cancelarAgendamentoEmergencia}
                  style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#ef4444', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>
                  🚨 Informar Emergência & Relançar Corrida Prioritária
                </button>
              </div>
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '13px' }}>
                Nenhum agendamento pendente. Você está livre para novas chamadas.
              </div>
            )}
          </div>

        </div>
      )}

      {/* 3. ABA PAINEL ADM */}
      {abaAtiva === 'adm' && (
        <div>
          {!autenticadoAdm ? (
            <div style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '12px', maxWidth: '400px', margin: '0 auto', textAlign: 'center', border: '1px solid #334155' }}>
              <h3 style={{ color: '#eab308', marginTop: 0 }}>Área Restrita ADM</h3>
              <form onSubmit={loginAdm}>
                <input 
                  type="password" 
                  placeholder="Senha ADM (padrão: 1234)" 
                  value={senhaInput} 
                  onChange={(e) => setSenhaInput(e.target.value)}
                  style={{ width: '80%', padding: '10px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', marginBottom: '15px', textAlign: 'center' }}
                />
                <br />
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#eab308', color: '#0f172a', fontWeight: 'bold', cursor: 'pointer' }}>
                  Entrar no Painel
                </button>
              </form>
            </div>
          ) : (
            <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#eab308' }}>Painel ADM DE PASSAGEM</h3>
                <button onClick={() => setAutenticadoAdm(false)} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#ef4444', color: '#fff', cursor: 'pointer' }}>
                  Sair
                </button>
              </div>

              {/* TRAVA GEOGRÁFICA (MODO ALAGOINHAS URBAN) */}
              <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #f97316' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h4 style={{ margin: 0, color: '#f97316' }}>📍 Trava Geográfica: Operação Alagoinhas</h4>
                    <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>
                      Bloqueia/Oculta linhas intermunicipais para testes e validação exaustiva no perímetro urbano de Alagoinhas.
                    </p>
                  </div>

                  <button 
                    onClick={() => setModoApenasUrbanoAlagoinhas(!modoApenasUrbanoAlagoinhas)}
                    style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: modoApenasUrbanoAlagoinhas ? '#ea580c' : '#475569', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
                    {modoApenasUrbanoAlagoinhas ? '✓ OPERAÇÃO ALAGOINHAS ATIVA' : '🔓 EXPANDIR REGIONAL'}
                  </button>
                </div>
              </div>

              {/* FORMULÁRIO PARA CADASTRAR NOVAS ROTAS / EMPRESAS LOCAIS */}
              <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px', marginBottom: '25px', border: '1px solid #334155' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#22c55e' }}>+ Cadastrar Novo Ponto de Empresa / Bairro em Alagoinhas</h4>
                <form onSubmit={adicionarNovaRota} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                  <input type="text" placeholder="Ex: Atacarejo / Murilo Cavalcante" value={novaRota.nome} onChange={(e) => setNovaRota({ ...novaRota, nome: e.target.value })} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#1e293b', color: '#fff' }} required />
                  <input type="text" placeholder="Ponto de Embarque" value={novaRota.pontoEmbarque} onChange={(e) => setNovaRota({ ...novaRota, pontoEmbarque: e.target.value })} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#1e293b', color: '#fff' }} required />
                  <input type="number" step="0.5" placeholder="Tarifa Vaga (R$)" value={novaRota.tarifaColetivo} onChange={(e) => setNovaRota({ ...novaRota, tarifaColetivo: parseFloat(e.target.value) || 0 })} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#1e293b', color: '#fff' }} required />
                  <input type="number" step="1" placeholder="Carro Exclusivo (R$)" value={novaRota.tarifaExclusivo} onChange={(e) => setNovaRota({ ...novaRota, tarifaExclusivo: parseFloat(e.target.value) || 0 })} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#1e293b', color: '#fff' }} required />
                  <button type="submit" style={{ padding: '8px 15px', borderRadius: '4px', border: 'none', backgroundColor: '#22c55e', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>+ Cadastrar Rota</button>
                </form>
              </div>

              {/* TABELA EDITÁVEL DE TARIFAS */}
              <h4 style={{ color: '#f1f5f9', marginBottom: '10px' }}>Editar Tarifas das Rotas Exibidas</h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #334155', color: '#f97316' }}>
                      <th style={{ padding: '10px' }}>Rota</th>
                      <th style={{ padding: '10px' }}>Vaga (R$)</th>
                      <th style={{ padding: '10px' }}>Carro Exclusivo (R$)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rotasExibidas.map((r) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #334155' }}>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>{r.nome}</td>
                        <td style={{ padding: '10px' }}>
                          <input 
                            type="number" 
                            step="0.50" 
                            value={r.tarifaColetivo} 
                            onChange={(e) => atualizarTarifa(r.id, 'tarifaColetivo', e.target.value)}
                            style={{ width: '80px', padding: '6px', borderRadius: '4px', backgroundColor: '#0f172a', color: '#22c55e', border: '1px solid #475569', fontWeight: 'bold' }} 
                          />
                        </td>
                        <td style={{ padding: '10px' }}>
                          <input 
                            type="number" 
                            step="1.00" 
                            value={r.tarifaExclusivo} 
                            onChange={(e) => atualizarTarifa(r.id, 'tarifaExclusivo', e.target.value)}
                            style={{ width: '80px', padding: '6px', borderRadius: '4px', backgroundColor: '#0f172a', color: '#eab308', border: '1px solid #475569', fontWeight: 'bold' }} 
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}
        </div>
      )}

    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
