import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

// Tabela base de Linhas e Rotas do Hub de Alagoinhas
const ROTAS_ALAGOINHAS_INICIAL = [
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
  { id: 10, nome: "Aramari ↔ Alagoinhas", categoria: "Intermunicipal", tipo: "Regional", tarifaColetivo: 6.00, tarifaExclusivo: 35.00, pontoEmbarque: "Terminal Central", vagasObrigatorias: 1, taxaRetornoVazio: 10.00 },
  { id: 11, nome: "Catu / Pojuca ↔ Alagoinhas", categoria: "Intermunicipal", tipo: "Regional", tarifaColetivo: 8.50, tarifaExclusivo: 55.00, pontoEmbarque: "Transbordo / Rodoviária", vagasObrigatorias: 1, taxaRetornoVazio: 15.00 }
];

function App() {
  const [abaAtiva, setAbaAtiva] = useState('passageiro');
  const [idRotaSelecionada, setIdRotaSelecionada] = useState(13);
  const [modalidade, setModalidade] = useState('coletivo');
  
  // RECURSO "INDO PARA CASA" (MODO DESTINO CONDUTOR)
  const [modoIndoParaCasa, setModoIndoParaCasa] = useState(false);
  const [destinoCasa, setDestinoCasa] = useState('Estêvão');

  // AUTENTICAÇÃO ADM
  const [autenticadoAdm, setAutenticadoAdm] = useState(false);
  const [senhaInput, setSenhaInput] = useState('');

  // PARÂMETROS OPERACIONAIS
  const [taxaPlataforma, setTaxaPlataforma] = useState(10); 
  const [reservaMinimaPassageiro, setReservaMinimaPassageiro] = useState(20.00); 
  const [saldoCarteiraPassageiro, setSaldoCarteiraPassageiro] = useState(25.00); 
  const [incluirGarantiaRetorno, setIncluirGarantiaRetorno] = useState(false);

  const [rotas, setRotas] = useState(ROTAS_ALAGOINHAS_INICIAL);
  const [novaRota, setNovaRota] = useState({ nome: '', categoria: 'Urbana', tarifaColetivo: 5, tarifaExclusivo: 30, pontoEmbarque: 'Centro', taxaRetornoVazio: 10 });

  const rotaSelecionada = rotas.find(r => r.id === Number(idRotaSelecionada)) || rotas[0];

  // CÁLCULOS
  const tarifaBaseCalculada = modalidade === 'coletivo' ? rotaSelecionada.tarifaColetivo : rotaSelecionada.tarifaExclusivo;
  const eLigeirinhoColetivo = modalidade === 'coletivo' && rotaSelecionada.vagasObrigatorias === 4;
  const faturamentoTotalCarro = eLigeirinhoColetivo ? (rotaSelecionada.tarifaColetivo * 4) : tarifaBaseCalculada;

  const adicionalRetorno = (modalidade === 'exclusivo' && incluirGarantiaRetorno) ? rotaSelecionada.taxaRetornoVazio : 0;
  const faturamentoBrutoComRetorno = faturamentoTotalCarro + adicionalRetorno;

  const valorDescontoPlataforma = (faturamentoBrutoComRetorno * taxaPlataforma) / 100;
  const valorLiquidoMotorista = faturamentoBrutoComRetorno - valorDescontoPlataforma;

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
    setNovaRota({ nome: '', categoria: 'Urbana', tarifaColetivo: 5, tarifaExclusivo: 30, pontoEmbarque: 'Centro', taxaRetornoVazio: 10 });
    alert('Nova rota adicionada com sucesso!');
  };

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', padding: '20px' }}>
      
      {/* Cabeçalho */}
      <header style={{ borderBottom: '1px solid #334155', paddingBottom: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#38bdf8', margin: 0, fontSize: '24px' }}>Alagoinhas Mobilidade</h1>
          <p style={{ color: '#94a3b8', margin: '5px 0 0 0', fontSize: '14px' }}>Gestão de Frota, Trava Anti-Calote & Modo "Indo Para Casa"</p>
        </div>
        <span style={{ backgroundColor: '#0284c7', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
          Operação Alagoinhas
        </span>
      </header>

      {/* Navegação */}
      <nav style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
        <button onClick={() => setAbaAtiva('passageiro')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: abaAtiva === 'passageiro' ? '#38bdf8' : '#1e293b', color: abaAtiva === 'passageiro' ? '#0f172a' : '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
          📱 Solicitar Corrida
        </button>
        <button onClick={() => setAbaAtiva('motorista_painel')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: abaAtiva === 'motorista_painel' ? '#22c55e' : '#1e293b', color: abaAtiva === 'motorista_painel' ? '#0f172a' : '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
          🚘 Painel do Condutor / Modo Destino
        </button>
        <button onClick={() => setAbaAtiva('adm')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: abaAtiva === 'adm' ? '#eab308' : '#1e293b', color: abaAtiva === 'adm' ? '#0f172a' : '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
          ⚙️ Painel ADM / Gestão
        </button>
      </nav>

      {/* 1. ABA PASSAGEIRO / SIMULADOR */}
      {abaAtiva === 'passageiro' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          
          <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
            <h3 style={{ marginTop: 0, color: '#f1f5f9' }}>1. Escolha de Rota & Embarque</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '5px' }}>SELECIONE O DESTINO</label>
              <select value={idRotaSelecionada} onChange={(e) => setIdRotaSelecionada(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569' }}>
                {rotas.map(r => (
                  <option key={r.id} value={r.id}>{r.nome}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '5px' }}>TIPO DE VIAGEM</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => setModalidade('coletivo')}
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #38bdf8', backgroundColor: modalidade === 'coletivo' ? '#0284c7' : '#0f172a', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
                  👥 Vaga / Ligeirinho
                </button>
                <button 
                  onClick={() => setModalidade('exclusivo')}
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #eab308', backgroundColor: modalidade === 'exclusivo' ? '#ca8a04' : '#0f172a', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
                  🚗 Carro Fechado
                </button>
              </div>
            </div>

            {/* Trava Anti-Calote */}
            <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px', borderLeft: passageiroAprovado ? '4px solid #22c55e' : '4px solid #ef4444' }}>
              <h4 style={{ margin: '0 0 5px 0', color: '#f8fafc' }}>Status da Carteira do Passageiro</h4>
              <p style={{ margin: '3px 0', fontSize: '13px', color: '#cbd5e1' }}>
                Saldo em Conta: <strong>R$ {saldoCarteiraPassageiro.toFixed(2)}</strong> | Reserva Mínima Exigida: <strong>R$ {reservaMinimaPassageiro.toFixed(2)}</strong>
              </p>
              
              {passageiroAprovado ? (
                <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#064e3b', color: '#6ee7b7', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  ✓ SOLICITAÇÃO AUTORIZADA: Saldo de garantia verificado.
                </div>
              ) : (
                <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#7f1d1d', color: '#fca5a5', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  ⚠️ BLOQUEADO: Saldo inferior à reserva de R$ {reservaMinimaPassageiro.toFixed(2)}.
                </div>
              )}
            </div>

          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
            <h3 style={{ marginTop: 0, color: '#f1f5f9' }}>2. Visão Financeira do Condutor</h3>
            
            <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
              <p style={{ margin: '0 0 5px 0', color: '#38bdf8', fontWeight: 'bold' }}>{rotaSelecionada.nome}</p>
              <p style={{ margin: '3px 0', fontSize: '13px', color: '#94a3b8' }}>📍 <strong>Embarque:</strong> {rotaSelecionada.pontoEmbarque}</p>
            </div>

            <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px' }}>
                <span>Tarifa Base da Viagem:</span>
                <strong style={{ color: '#fff' }}>R$ {faturamentoTotalCarro.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px', color: '#ef4444' }}>
                <span>Taxa da Plataforma ({taxaPlataforma}%):</span>
                <strong>- R$ {valorDescontoPlataforma.toFixed(2)}</strong>
              </div>
              <hr style={{ borderColor: '#334155', margin: '10px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', color: '#22c55e' }}>
                <span>Líquido Garantido ao Condutor:</span>
                <strong>R$ {valorLiquidoMotorista.toFixed(2)}</strong>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 2. ABA PAINEL DO CONDUTOR / MODO INDO PARA CASA */}
      {abaAtiva === 'motorista_painel' && (
        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
          <h3 style={{ marginTop: 0, color: '#22c55e' }}>Painel do Condutor & Rota de Retorno</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Ative o <strong>Modo "Indo para Casa"</strong> no encerramento do seu turno para o aplicativo alocar corridas no seu trajeto de volta.
          </p>

          <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h4 style={{ margin: 0, color: '#f8fafc' }}>🏠 Status da Rota Final de Retorno</h4>
                <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>
                  {modoIndoParaCasa ? `Buscando passageiros com destino a: ${destinoCasa}` : 'Modo padrão ativo (Atendendo todas as áreas de Alagoinhas)'}
                </p>
              </div>

              <button 
                onClick={() => setModoIndoParaCasa(!modoIndoParaCasa)}
                style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: modoIndoParaCasa ? '#22c55e' : '#475569', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
                {modoIndoParaCasa ? '✓ MODO "INDO PARA CASA" ATIVO' : 'ATIVAR MODO "INDO PARA CASA"'}
              </button>
            </div>

            {modoIndoParaCasa && (
              <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                <label style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 'bold' }}>SELEICONE SEU DISTRITO / POVOADO DE RESIDÊNCIA:</label>
                <select value={destinoCasa} onChange={(e) => setDestinoCasa(e.target.value)} style={{ padding: '8px', borderRadius: '6px', backgroundColor: '#1e293b', color: '#fff', border: '1px solid #475569', fontWeight: 'bold' }}>
                  <option value="Estêvão">Estêvão</option>
                  <option value="Boa União">Boa União</option>
                  <option value="Fazenda Catuzinho">Fazenda Catuzinho</option>
                  <option value="Riacho da Guia / Calu">Riacho da Guia / Calu</option>
                  <option value="Aramari">Aramari</option>
                  <option value="Pedrão">Pedrão</option>
                  <option value="Catu / Pojuca">Catu / Pojuca</option>
                </select>
              </div>
            )}
          </div>

          <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #22c55e' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#22c55e' }}>Como funciona a otimização de retorno:</h4>
            <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px', color: '#cbd5e1', fontSize: '13px', lineHeight: '1.6' }}>
              <li>O sistema canaliza passageiros do Centro de Alagoinhas que pretendem desembarcar no seu caminho de volta.</li>
              <li>Evita que o condutor rode de vaga vazia ou absorva o custo do combustível do retorno para casa.</li>
              <li>Faturamento direto creditado na carteira com verificação do saldo de garantia prévio.</li>
            </ul>
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
