import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

// Tabela base de Linhas e Rotas do Hub de Alagoinhas
const ROTAS_ALAGOINHAS_INICIAL = [
  // --- ROTA DE CORUJÃO / MADRUGADA (COLETA PROGRAMADA) ---
  { id: 15, nome: "Rota Corujão Madrugada (Hospital / Fábricas / Centro)", categoria: "Madrugada", tipo: "Van / Carro Compartilhado", tarifaColetivo: 7.00, tarifaExclusivo: 40.00, pontoEmbarque: "Pontos Agendados de Coleta", vagasObrigatorias: 4, taxaRetornoVazio: 0.00 },

  // --- EIXOS RODOVIÁRIOS / LIGEIRINHO EXPRESS ---
  { id: 13, nome: "Alagoinhas ↔ Feira de Santana (Ligeirinho Express)", categoria: "Intermunicipal", tipo: "Carro Compartilhado (4 Vagas)", tarifaColetivo: 40.00, tarifaExclusivo: 160.00, pontoEmbarque: "Praça Rui Barbosa / Viaduto / Rodoviária", vagasObrigatorias: 4, taxaRetornoVazio: 30.00 },
  { id: 14, nome: "Alagoinhas ↔ Salvador (Ligeirinho Express)", categoria: "Intermunicipal", tipo: "Carro Compartilhado (4 Vagas)", tarifaColetivo: 50.00, tarifaExclusivo: 200.00, pontoEmbarque: "Praça Rui Barbosa / Viaduto / Rodoviária", vagasObrigatorias: 4, taxaRetornoVazio: 50.00 },

  // --- URBANOS & BAIRROS ---
  { id: 1, nome: "Mangalô / Santa Terezinha ↔ Centro", categoria: "Urbana", tipo: "Urbano / Bairro", tarifaColetivo: 4.00, tarifaExclusivo: 25.00, pontoEmbarque: "Qualquer Ponto Central / Bairro", vagasObrigatorias: 1, taxaRetornoVazio: 0.00 },
  { id: 2, nome: "Alagoinhas Velha / Praça Kennedy ↔ Centro", categoria: "Urbana", tipo: "Urbano / Bairro", tarifaColetivo: 4.50, tarifaExclusivo: 25.00, pontoEmbarque: "Praça Kennedy / Centro", vagasObrigatorias: 1, taxaRetornoVazio: 0.00 },

  // --- DISTRITAIS RURAIS ---
  { id: 5, nome: "Fazenda Catuzinho ↔ Centro", categoria: "Distrital", tipo: "Povoado / Rural", tarifaColetivo: 4.50, tarifaExclusivo: 25.00, pontoEmbarque: "Transbordo / Centro", vagasObrigatorias: 1, taxaRetornoVazio: 8.00 },
  { id: 6, nome: "Boa União ↔ Centro", categoria: "Distrital", tipo: "Povoado / Rural", tarifaColetivo: 5.50, tarifaExclusivo: 30.00, pontoEmbarque: "Transbordo", vagasObrigatorias: 1, taxaRetornoVazio: 10.00 },
  { id: 7, nome: "Estêvão ↔ Centro", categoria: "Distrital", tipo: "Povoado / Rural", tarifaColetivo: 5.00, tarifaExclusivo: 28.00, pontoEmbarque: "Transbordo", vagasObrigatorias: 1, taxaRetornoVazio: 8.00 },
  { id: 8, nome: "Riacho da Guia / Calu ↔ Transbordo", categoria: "Distrital", tipo: "Distrito / Rural", tarifaColetivo: 7.00, tarifaExclusivo: 45.00, pontoEmbarque: "Transbordo", vagasObrigatorias: 1, taxaRetornoVazio: 15.00 },

  // --- INTERMUNICIPAIS REGIONAIS ---
  { id: 9, nome: "Pedrão ↔ Alagoinhas", categoria: "Intermunicipal", tipo: "Regional", tarifaColetivo: 9.00, tarifaExclusivo: 60.00, pontoEmbarque: "Viaduto / Centro", vagasObrigatorias: 1, taxaRetornoVazio: 15.00 },
  { id: 10, nome: "Aramari ↔ Alagoinhas", categoria: "Intermunicipal", tipo: "Regional", tarifaColetivo: 6.00, tarifaExclusivo: 35.00, pontoEmbarque: "Terminal Central", vagasObrigatorias: 1, taxaRetornoVazio: 10.00 }
];

function App() {
  const [abaAtiva, setAbaAtiva] = useState('passageiro');
  const [idRotaSelecionada, setIdRotaSelecionada] = useState(15); // Padrão: Corujão Madrugada
  const [modalidade, setModalidade] = useState('coletivo');
  const [qtdPassageirosPonto, setQtdPassageirosPonto] = useState(1); // Número de pessoas no mesmo ponto
  
  // RECURSO "INDO PARA CASA"
  const [modoIndoParaCasa, setModoIndoParaCasa] = useState(false);
  const [destinoCasa, setDestinoCasa] = useState('Estêvão');

  // AUTENTICAÇÃO ADM
  const [autenticadoAdm, setAutenticadoAdm] = useState(false);
  const [senhaInput, setSenhaInput] = useState('');

  // PARÂMETROS OPERACIONAIS
  const [taxaPlataforma, setTaxaPlataforma] = useState(10); 
  const [reservaMinimaPassageiro, setReservaMinimaPassageiro] = useState(20.00); 
  const [saldoCarteiraPassageiro, setSaldoCarteiraPassageiro] = useState(25.00); 

  const [rotas, setRotas] = useState(ROTAS_ALAGOINHAS_INICIAL);
  const rotaSelecionada = rotas.find(r => r.id === Number(idRotaSelecionada)) || rotas[0];

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

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', padding: '20px' }}>
      
      {/* Cabeçalho */}
      <header style={{ borderBottom: '1px solid #334155', paddingBottom: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#38bdf8', margin: 0, fontSize: '24px' }}>Alagoinhas Mobilidade</h1>
          <p style={{ color: '#94a3b8', margin: '5px 0 0 0', fontSize: '14px' }}>Coleta de Madrugada & Multi-Passageiros por Parada</p>
        </div>
        <span style={{ backgroundColor: '#0284c7', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
          Operação 24 Horas
        </span>
      </header>

      {/* Navegação */}
      <nav style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
        <button onClick={() => setAbaAtiva('passageiro')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: abaAtiva === 'passageiro' ? '#38bdf8' : '#1e293b', color: abaAtiva === 'passageiro' ? '#0f172a' : '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
          📱 Agendar / Solicitar
        </button>
        <button onClick={() => setAbaAtiva('motorista_painel')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: abaAtiva === 'motorista_painel' ? '#22c55e' : '#1e293b', color: abaAtiva === 'motorista_painel' ? '#0f172a' : '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
          🚘 Painel do Condutor
        </button>
        <button onClick={() => setAbaAtiva('adm')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: abaAtiva === 'adm' ? '#eab308' : '#1e293b', color: abaAtiva === 'adm' ? '#0f172a' : '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
          ⚙️ Painel ADM
        </button>
      </nav>

      {/* 1. ABA PASSAGEIRO / SIMULADOR */}
      {abaAtiva === 'passageiro' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          
          <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
            <h3 style={{ marginTop: 0, color: '#f1f5f9' }}>1. Agendamento & Vagas por Ponto</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '5px' }}>SELECIONE A LINHA / ROTA</label>
              <select value={idRotaSelecionada} onChange={(e) => setIdRotaSelecionada(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569' }}>
                {rotas.map(r => (
                  <option key={r.id} value={r.id}>{r.nome}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '5px' }}>TIPO DE EMBARQUE</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => setModalidade('coletivo')}
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #38bdf8', backgroundColor: modalidade === 'coletivo' ? '#0284c7' : '#0f172a', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
                  👥 Assento / Vaga
                </button>
                <button 
                  onClick={() => setModalidade('exclusivo')}
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #eab308', backgroundColor: modalidade === 'exclusivo' ? '#ca8a04' : '#0f172a', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
                  🚗 Carro Exclusivo
                </button>
              </div>
            </div>

            {/* Seletor de Quantidade de Pessoas no Mesmo Embarque */}
            {modalidade === 'coletivo' && (
              <div style={{ marginBottom: '15px', backgroundColor: '#0f172a', padding: '12px', borderRadius: '8px', border: '1px solid #38bdf8' }}>
                <label style={{ display: 'block', color: '#38bdf8', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>
                  Quantas pessoas vão embarcar nesta parada?
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {[1, 2, 3, 4].map(num => (
                    <button 
                      key={num}
                      onClick={() => setQtdPassageirosPonto(num)}
                      style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: qtdPassageirosPonto === num ? '#0284c7' : '#1e293b', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
                      {num} {num === 1 ? 'Pessoa' : 'Pessoas'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trava Anti-Calote */}
            <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px', borderLeft: passageiroAprovado ? '4px solid #22c55e' : '4px solid #ef4444' }}>
              <h4 style={{ margin: '0 0 5px 0', color: '#f8fafc' }}>Status da Carteira do Passageiro</h4>
              <p style={{ margin: '3px 0', fontSize: '13px', color: '#cbd5e1' }}>
                Saldo em Conta: <strong>R$ {saldoCarteiraPassageiro.toFixed(2)}</strong> | Reserva Exigida: <strong>R$ {reservaMinimaPassageiro.toFixed(2)}</strong>
              </p>
              
              {passageiroAprovado ? (
                <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#064e3b', color: '#6ee7b7', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  ✓ SOLICITAÇÃO AUTORIZADA: Saldo verificado para o agendamento!
                </div>
              ) : (
                <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#7f1d1d', color: '#fca5a5', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  ⚠️ BLOQUEADO: Saldo insuficiente na reserva de garantia.
                </div>
              )}
            </div>

          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
            <h3 style={{ marginTop: 0, color: '#f1f5f9' }}>2. Resumo da Viagem & Repasse</h3>
            
            <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
              <p style={{ margin: '0 0 5px 0', color: '#38bdf8', fontWeight: 'bold' }}>{rotaSelecionada.nome}</p>
              <p style={{ margin: '3px 0', fontSize: '13px', color: '#94a3b8' }}>
                📍 <strong>Ponto de Coleta:</strong> {rotaSelecionada.pontoEmbarque}
              </p>
              <p style={{ margin: '3px 0', fontSize: '13px', color: '#cbd5e1' }}>
                👥 <strong>Passageiros no Embarque:</strong> {modalidade === 'coletivo' ? `${qtdPassageirosPonto} pessoa(s)` : 'Carro Fechado'}
              </p>
            </div>

            <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px' }}>
                <span>Valor Total Desta Parada:</span>
                <strong style={{ color: '#fff' }}>R$ {valorTotalPague.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px', color: '#ef4444' }}>
                <span>Taxa da Plataforma ({taxaPlataforma}%):</span>
                <strong>- R$ {valorDescontoPlataforma.toFixed(2)}</strong>
              </div>
              <hr style={{ borderColor: '#334155', margin: '10px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', color: '#22c55e' }}>
                <span>Líquido do Motorista (Nesta Parada):</span>
                <strong>R$ {valorLiquidoMotorista.toFixed(2)}</strong>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 2. ABA PAINEL DO CONDUTOR */}
      {abaAtiva === 'motorista_painel' && (
        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
          <h3 style={{ marginTop: 0, color: '#22c55e' }}>Painel do Condutor: Escala de Madrugada</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Atenda grupos de trabalhadores com rotas agendadas sequenciais.
          </p>

          <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #38bdf8' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#38bdf8' }}>Exemplo de Rota Agendada (Saída da Madrugada):</h4>
            <div style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '10px' }}>
              <p style={{ margin: '4px 0' }}>📍 <strong>Parada 1 (04:45):</strong> Hospital Regional (2 Passageiros) — <em>R$ 14,00</em></p>
              <p style={{ margin: '4px 0' }}>📍 <strong>Parada 2 (04:55):</strong> Posto BR / Mangalô (1 Passageiro) — <em>R$ 7,00</em></p>
              <p style={{ margin: '4px 0' }}>📍 <strong>Parada 3 (05:05):</strong> Centro / Praça (1 Passageiro) — <em>R$ 7,00</em></p>
              <hr style={{ borderColor: '#334155', margin: '8px 0' }} />
              <p style={{ margin: '4px 0', color: '#22c55e', fontWeight: 'bold' }}>💰 Total acumulado na corrida: R$ 28,00 em 20 minutos de trajeto.</p>
            </div>
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
                <h3 style={{ margin: 0, color: '#eab308' }}>Painel do Administrador</h3>
                <button onClick={() => setAutenticadoAdm(false)} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#ef4444', color: '#fff', cursor: 'pointer' }}>
                  Sair do ADM
                </button>
              </div>

              {/* Tabela Editável */}
              <h4 style={{ color: '#f1f5f9', marginBottom: '10px' }}>Editar Tarifas & Parâmetros Regionais</h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #334155', color: '#38bdf8' }}>
                      <th style={{ padding: '10px' }}>Rota</th>
                      <th style={{ padding: '10px' }}>Vaga (R$)</th>
                      <th style={{ padding: '10px' }}>Carro Fechado (R$)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rotas.map((r) => (
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
