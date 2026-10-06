import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

// Tabela base de Linhas e Rotas do Hub de Alagoinhas
const ROTAS_ALAGOINHAS_INICIAL = [
  { id: 15, nome: "Rota Corujão Madrugada (Hospital / Santa Terezinha / Centro)", categoria: "Madrugada", tipo: "Van / Carro Compartilhado", tarifaColetivo: 7.00, tarifaExclusivo: 40.00, pontoEmbarque: "Pontos Agendados de Coleta", vagasObrigatorias: 4, taxaRetornoVazio: 0.00 },
  { id: 13, nome: "Alagoinhas ↔ Feira de Santana (Ligeirinho Express)", categoria: "Intermunicipal", tipo: "Carro Compartilhado (4 Vagas)", tarifaColetivo: 40.00, tarifaExclusivo: 160.00, pontoEmbarque: "Praça Rui Barbosa / Viaduto / Rodoviária", vagasObrigatorias: 4, taxaRetornoVazio: 30.00 },
  { id: 14, nome: "Alagoinhas ↔ Salvador (Ligeirinho Express)", categoria: "Intermunicipal", tipo: "Carro Compartilhado (4 Vagas)", tarifaColetivo: 50.00, tarifaExclusivo: 200.00, pontoEmbarque: "Praça Rui Barbosa / Viaduto / Rodoviária", vagasObrigatorias: 4, taxaRetornoVazio: 50.00 },
  { id: 1, nome: "Mangalô / Santa Terezinha ↔ Centro", categoria: "Urbana", tipo: "Urbano / Bairro", tarifaColetivo: 4.00, tarifaExclusivo: 25.00, pontoEmbarque: "Qualquer Ponto Central / Bairro", vagasObrigatorias: 1, taxaRetornoVazio: 0.00 },
  { id: 2, nome: "Alagoinhas Velha / Praça Kennedy ↔ Centro", categoria: "Urbana", tipo: "Urbano / Bairro", tarifaColetivo: 4.50, tarifaExclusivo: 25.00, pontoEmbarque: "Praça Kennedy / Centro", vagasObrigatorias: 1, taxaRetornoVazio: 0.00 },
  { id: 5, nome: "Fazenda Catuzinho ↔ Centro", categoria: "Distrital", tipo: "Povoado / Rural", tarifaColetivo: 4.50, tarifaExclusivo: 25.00, pontoEmbarque: "Transbordo / Centro", vagasObrigatorias: 1, taxaRetornoVazio: 8.00 },
  { id: 6, nome: "Boa União ↔ Centro", categoria: "Distrital", tipo: "Povoado / Rural", tarifaColetivo: 5.50, tarifaExclusivo: 30.00, pontoEmbarque: "Transbordo", vagasObrigatorias: 1, taxaRetornoVazio: 10.00 },
  { id: 7, nome: "Estêvão ↔ Centro", categoria: "Distrital", tipo: "Povoado / Rural", tarifaColetivo: 5.00, tarifaExclusivo: 28.00, pontoEmbarque: "Transbordo", vagasObrigatorias: 1, taxaRetornoVazio: 8.00 },
  { id: 8, nome: "Riacho da Guia / Calu ↔ Transbordo", categoria: "Distrital", tipo: "Distrito / Rural", tarifaColetivo: 7.00, tarifaExclusivo: 45.00, pontoEmbarque: "Transbordo", vagasObrigatorias: 1, taxaRetornoVazio: 15.00 },
  { id: 9, nome: "Pedrão ↔ Alagoinhas", categoria: "Intermunicipal", tipo: "Regional", tarifaColetivo: 9.00, tarifaExclusivo: 60.00, pontoEmbarque: "Viaduto / Centro", vagasObrigatorias: 1, taxaRetornoVazio: 15.00 },
  { id: 10, nome: "Aramari ↔ Alagoinhas", categoria: "Intermunicipal", tipo: "Regional", tarifaColetivo: 6.00, tarifaExclusivo: 35.00, pontoEmbarque: "Terminal Central", vagasObrigatorias: 1, taxaRetornoVazio: 10.00 }
];

function App() {
  const [abaAtiva, setAbaAtiva] = useState('passageiro');
  const [idRotaSelecionada, setIdRotaSelecionada] = useState(15);
  const [modalidade, setModalidade] = useState('coletivo');
  const [qtdPassageirosPonto, setQtdPassageirosPonto] = useState(1);
  
  // MODO SOBERANIA NACIONAL (BLOQUEIO DE RECURSOS GLOBAIS)
  const [modoApenasNacional, setModoApenasNacional] = useState(true);

  // SEGURANÇA & PIN
  const [codigoPinEmbarque] = useState('8421');
  const [pinDigitadoMotorista, setPinDigitadoMotorista] = useState('');
  const [corridaIniciadaSegura, setCorridaIniciadaSegura] = useState(false);

  // AUTENTICAÇÃO ADM
  const [autenticadoAdm, setAutenticadoAdm] = useState(false);
  const [senhaInput, setSenhaInput] = useState('');

  // PARÂMETROS OPERACIONAIS
  const [taxaPlataforma, setTaxaPlataforma] = useState(10); 
  const [reservaMinimaPassageiro] = useState(20.00); 
  const [saldoCarteiraPassageiro] = useState(25.00); 

  const [rotas, setRotas] = useState(ROTAS_ALAGOINHAS_INICIAL);
  const rotaSelecionada = rotas.find(r => r.id === Number(idRotaSelecionada)) || rotas[0];

  // CÁLCULOS
  const tarifaUnitaria = modalidade === 'coletivo' ? rotaSelecionada.tarifaColetivo : rotaSelecionada.tarifaExclusivo;
  const valorTotalPague = modalidade === 'coletivo' ? (tarifaUnitaria * qtdPassageirosPonto) : tarifaUnitaria;

  const valorDescontoPlataforma = (valorTotalPague * taxaPlataforma) / 100;
  const valorLiquidoMotorista = valorTotalPague - valorDescontoPlataforma;

  const passageiroAprovado = saldoCarteiraPassageiro >= reservaMinimaPassageiro;

  const loginAdm = (e) => {
    e.preventDefault();
    if (senhaInput === '1234') {
      setAutenticadoAdm(true);
    } else {
      alert('Senha incorreta! Use: 1234');
    }
  };

  const validarPinMotorista = (e) => {
    e.preventDefault();
    if (pinDigitadoMotorista === codigoPinEmbarque) {
      setCorridaIniciadaSegura(true);
      alert('✓ CÓDIGO CONFIRMADO! Embarque liberado na Trilha Nacional.');
    } else {
      alert('❌ CÓDIGO INCORRETO! Solicite o PIN de 4 dígitos ao passageiro.');
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', padding: '20px' }}>
      
      {/* Cabeçalho */}
      <header style={{ borderBottom: '1px solid #334155', paddingBottom: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ color: '#38bdf8', margin: 0, fontSize: '24px' }}>Alagoinhas Mobilidade</h1>
          <p style={{ color: '#94a3b8', margin: '5px 0 0 0', fontSize: '14px' }}>Ecossistema Regional de Pagamentos & Mobilidade Livre de Bandeiras Globais</p>
        </div>

        {modoApenasNacional ? (
          <span style={{ backgroundColor: '#064e3b', color: '#6ee7b7', border: '1px solid #059669', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
            🇧🇷 Trilha 100% Nacional / Pix Ativa (Zero Visa/Master)
          </span>
        ) : (
          <span style={{ backgroundColor: '#475569', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
            🌐 Modo Híbrido Global
          </span>
        )}
      </header>

      {/* Navegação */}
      <nav style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
        <button onClick={() => setAbaAtiva('passageiro')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: abaAtiva === 'passageiro' ? '#38bdf8' : '#1e293b', color: abaAtiva === 'passageiro' ? '#0f172a' : '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
          📱 Passageiro
        </button>
        <button onClick={() => setAbaAtiva('motorista_painel')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: abaAtiva === 'motorista_painel' ? '#22c55e' : '#1e293b', color: abaAtiva === 'motorista_painel' ? '#0f172a' : '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
          🚘 Painel do Condutor
        </button>
        <button onClick={() => setAbaAtiva('adm')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: abaAtiva === 'adm' ? '#eab308' : '#1e293b', color: abaAtiva === 'adm' ? '#0f172a' : '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
          ⚙️ Painel ADM & Trava Nacional
        </button>
      </nav>

      {/* 1. ABA PASSAGEIRO */}
      {abaAtiva === 'passageiro' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          
          <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
            <h3 style={{ marginTop: 0, color: '#f1f5f9' }}>1. Seleção de Rota</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '5px' }}>DESTINO / ROTA REGIONAL</label>
              <select value={idRotaSelecionada} onChange={(e) => setIdRotaSelecionada(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569' }}>
                {rotas.map(r => (
                  <option key={r.id} value={r.id}>{r.nome}</option>
                ))}
              </select>
            </div>

            {/* MEIOS DE PAGAMENTO PERMITIDOS */}
            <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '10px', marginBottom: '15px', border: '1px solid #38bdf8' }}>
              <h4 style={{ margin: '0 0 5px 0', color: '#38bdf8' }}>💳 Forma de Pagamento Habilitada</h4>
              {modoApenasNacional ? (
                <div style={{ fontSize: '13px', color: '#6ee7b7', fontWeight: 'bold' }}>
                  ✓ Pix Direto / Carteira Digital Nacional (Sem intermediários estrangeiros)
                </div>
              ) : (
                <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                  Cartão de Crédito / Débito / Pix
                </div>
              )}
            </div>

            {/* CARD PIN */}
            <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '10px', border: '1px solid #22c55e' }}>
              <h4 style={{ margin: '0 0 5px 0', color: '#22c55e' }}>🔑 PIN de Embarque: {codigoPinEmbarque}</h4>
              <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1' }}>Informe ao condutor ao entrar no veículo.</p>
            </div>

          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
            <h3 style={{ marginTop: 0, color: '#f1f5f9' }}>2. Repasse Transparente</h3>
            <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px' }}>
                <span>Valor Total da Corrida:</span>
                <strong style={{ color: '#fff' }}>R$ {valorTotalPague.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px', color: '#ef4444' }}>
                <span>Taxa da Plataforma ({taxaPlataforma}%):</span>
                <strong>- R$ {valorDescontoPlataforma.toFixed(2)}</strong>
              </div>
              <hr style={{ borderColor: '#334155', margin: '10px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', color: '#22c55e' }}>
                <span>Líquido ao Condutor:</span>
                <strong>R$ {valorLiquidoMotorista.toFixed(2)}</strong>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 2. ABA CONDUTOR */}
      {abaAtiva === 'motorista_painel' && (
        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
          <h3 style={{ marginTop: 0, color: '#22c55e' }}>Painel do Condutor</h3>
          <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '10px', border: '1px solid #334155' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#eab308' }}>🔑 Iniciar Viagem com PIN</h4>
            {!corridaIniciadaSegura ? (
              <form onSubmit={validarPinMotorista} style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  maxLength="4" 
                  placeholder="Ex: 8421" 
                  value={pinDigitadoMotorista}
                  onChange={(e) => setPinDigitadoMotorista(e.target.value)}
                  style={{ padding: '10px', borderRadius: '6px', backgroundColor: '#1e293b', color: '#22c55e', fontSize: '18px', fontWeight: 'bold', width: '120px', textAlign: 'center' }}
                  required 
                />
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#22c55e', color: '#0f172a', fontWeight: 'bold', cursor: 'pointer' }}>
                  ✓ Iniciar
                </button>
              </form>
            ) : (
              <div style={{ padding: '12px', backgroundColor: '#064e3b', color: '#6ee7b7', borderRadius: '6px', fontWeight: 'bold' }}>
                ✓ VIAGEM AUTENTICADA COM SUCESSO.
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
                  style={{ width: '80%', padding: '10px', borderRadius: '6px', backgroundColor: '#0f172a', color: '#fff', marginBottom: '15px', textAlign: 'center' }}
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
                <h3 style={{ margin: 0, color: '#eab308' }}>Painel do Administrador & Arquitetura Soberana</h3>
                <button onClick={() => setAutenticadoAdm(false)} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#ef4444', color: '#fff', cursor: 'pointer' }}>
                  Sair
                </button>
              </div>

              {/* CHAVE DE BLOQUEIO DE BANDEIRAS E FUNÇÕES GLOBAIS */}
              <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #38bdf8' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h4 style={{ margin: 0, color: '#38bdf8' }}>🇧🇷 Modo Soberania Nacional & Circulação Local</h4>
                    <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>
                      Bloqueia cartões internacionais (Visa/Mastercard) e opera unicamente via Pix/BaaS Nacional em Alagoinhas.
                    </p>
                  </div>

                  <button 
                    onClick={() => setModoApenasNacional(!modoApenasNacional)}
                    style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: modoApenasNacional ? '#22c55e' : '#ef4444', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
                    {modoApenasNacional ? '✓ TRAVA NACIONAL ATIVA' : '🔓 BANDEIRAS GLOBAIS LIBERADAS'}
                  </button>
                </div>
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
