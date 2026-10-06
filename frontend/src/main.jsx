import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

// Tabela base de Linhas e Rotas do Hub de Alagoinhas
const ROTAS_ALAGOINHAS_INICIAL = [
  // --- EIXOS RODOVIÁRIOS / LIGEIRINHO EXPRESS ---
  { id: 13, nome: "Alagoinhas ↔ Feira de Santana (Ligeirinho Express)", categoria: "Intermunicipal", tipo: "Carro Compartilhado (4 Vagas)", tarifaColetivo: 40.00, tarifaExclusivo: 160.00, pontoEmbarque: "Praça Rui Barbosa / Viaduto / Rodoviária", vagasObrigatorias: 4 },
  { id: 14, nome: "Alagoinhas ↔ Salvador (Ligeirinho Express)", categoria: "Intermunicipal", tipo: "Carro Compartilhado (4 Vagas)", tarifaColetivo: 50.00, tarifaExclusivo: 200.00, pontoEmbarque: "Praça Rui Barbosa / Viaduto / Rodoviária", vagasObrigatorias: 4 },

  // --- URBANOS & BAIRROS ---
  { id: 1, nome: "Mangalô / Santa Terezinha ↔ Centro", categoria: "Urbana", tipo: "Urbano / Bairro", tarifaColetivo: 4.00, tarifaExclusivo: 25.00, pontoEmbarque: "Qualquer Ponto Central / Bairro", vagasObrigatorias: 1 },
  { id: 2, nome: "Alagoinhas Velha / Praça Kennedy ↔ Centro", categoria: "Urbana", tipo: "Urbano / Bairro", tarifaColetivo: 4.50, tarifaExclusivo: 25.00, pontoEmbarque: "Praça Kennedy / Centro", vagasObrigatorias: 1 },

  // --- DISTRITAIS RURAIS ---
  { id: 5, nome: "Fazenda Catuzinho ↔ Centro", categoria: "Distrital", tipo: "Povoado / Rural", tarifaColetivo: 4.50, tarifaExclusivo: 25.00, pontoEmbarque: "Transbordo / Centro", vagasObrigatorias: 1 },
  { id: 6, nome: "Boa União ↔ Centro", categoria: "Distrital", tipo: "Povoado / Rural", tarifaColetivo: 5.50, tarifaExclusivo: 30.00, pontoEmbarque: "Transbordo", vagasObrigatorias: 1 },
  { id: 7, nome: "Estêvão ↔ Centro", categoria: "Distrital", tipo: "Povoado / Rural", tarifaColetivo: 5.00, tarifaExclusivo: 28.00, pontoEmbarque: "Transbordo", vagasObrigatorias: 1 },
  { id: 8, nome: "Riacho da Guia / Calu ↔ Transbordo", categoria: "Distrital", tipo: "Distrito / Rural", tarifaColetivo: 7.00, tarifaExclusivo: 45.00, pontoEmbarque: "Transbordo", vagasObrigatorias: 1 },

  // --- INTERMUNICIPAIS REGIONAIS ---
  { id: 9, nome: "Pedrão ↔ Alagoinhas", categoria: "Intermunicipal", tipo: "Regional", tarifaColetivo: 9.00, tarifaExclusivo: 60.00, pontoEmbarque: "Viaduto / Centro", vagasObrigatorias: 1 },
  { id: 10, nome: "Aramari ↔ Alagoinhas", categoria: "Intermunicipal", tipo: "Regional", tarifaColetivo: 6.00, tarifaExclusivo: 35.00, pontoEmbarque: "Terminal Central", vagasObrigatorias: 1 },
  { id: 11, nome: "Catu / Pojuca ↔ Alagoinhas", categoria: "Intermunicipal", tipo: "Regional", tarifaColetivo: 8.50, tarifaExclusivo: 55.00, pontoEmbarque: "Transbordo / Rodoviária", vagasObrigatorias: 1 }
];

function App() {
  const [abaAtiva, setAbaAtiva] = useState('passageiro');
  const [idRotaSelecionada, setIdRotaSelecionada] = useState(13); // Padrão: Feira de Santana (Ligeirinho)
  const [modalidade, setModalidade] = useState('coletivo'); // 'coletivo' ou 'exclusivo'
  
  // PARÂMETROS CONFIGURÁVEIS DA PLATAFORMA
  const [taxaPlataforma, setTaxaPlataforma] = useState(10); // % de retenção
  const [reservaMinimaPassageiro, setReservaMinimaPassageiro] = useState(20.00); // Saldo mínimo obrigatório
  
  // Carteira Simulada do Passageiro
  const [saldoCarteiraPassageiro, setSaldoCarteiraPassageiro] = useState(25.00); 

  const [rotas, setRotas] = useState(ROTAS_ALAGOINHAS_INICIAL);
  const rotaSelecionada = rotas.find(r => r.id === Number(idRotaSelecionada)) || rotas[0];

  // Cálculos da Corrida
  const tarifaBaseCalculada = modalidade === 'coletivo' ? rotaSelecionada.tarifaColetivo : rotaSelecionada.tarifaExclusivo;
  
  // Se for Ligeirinho (4 vagas coletivas)
  const eLigeirinhoColetivo = modalidade === 'coletivo' && rotaSelecionada.vagasObrigatorias === 4;
  const faturamentoTotalCarro = eLigeirinhoColetivo ? (rotaSelecionada.tarifaColetivo * 4) : tarifaBaseCalculada;

  const valorDescontoPlataforma = (faturamentoTotalCarro * taxaPlataforma) / 100;
  const valorLiquidoMotorista = faturamentoTotalCarro - valorDescontoPlataforma;

  // Validação de Segurança do Passageiro
  const passageiroAprovado = saldoCarteiraPassageiro >= reservaMinimaPassageiro;

  const atualizarTarifa = (id, campo, novoValor) => {
    const val = parseFloat(novoValor) || 0;
    setRotas(rotas.map(r => r.id === id ? { ...r, [campo]: val } : r));
  };

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', padding: '20px' }}>
      
      {/* Cabeçalho */}
      <header style={{ borderBottom: '1px solid #334155', paddingBottom: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#38bdf8', margin: 0, fontSize: '24px' }}>Alagoinhas Mobilidade</h1>
          <p style={{ color: '#94a3b8', margin: '5px 0 0 0', fontSize: '14px' }}>Proteção Anti-Calote ao Motorista & Ligeirinho Express</p>
        </div>
        <span style={{ backgroundColor: '#0284c7', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
          Sistema Protegido
        </span>
      </header>

      {/* Navegação */}
      <nav style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
        <button onClick={() => setAbaAtiva('passageiro')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: abaAtiva === 'passageiro' ? '#38bdf8' : '#1e293b', color: abaAtiva === 'passageiro' ? '#0f172a' : '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
          Solicitar Corrida / Trajeto
        </button>
        <button onClick={() => setAbaAtiva('gestao')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: abaAtiva === 'gestao' ? '#38bdf8' : '#1e293b', color: abaAtiva === 'gestao' ? '#0f172a' : '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
          Painel Gestor (Regras & Tarifas)
        </button>
      </nav>

      {/* Conteúdo Passageiro & Simulação */}
      {abaAtiva === 'passageiro' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          
          {/* Coluna 1: Solicitação */}
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

            {/* Alternador Coletivo vs Exclusivo */}
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

            {/* Trava Anti-Calote no Passageiro */}
            <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px', borderLeft: passageiroAprovado ? '4px solid #22c55e' : '4px solid #ef4444' }}>
              <h4 style={{ margin: '0 0 5px 0', color: '#f8fafc' }}>Status da Carteira do Passageiro</h4>
              <p style={{ margin: '3px 0', fontSize: '13px', color: '#cbd5e1' }}>
                Saldo em Conta: <strong>R$ {saldoCarteiraPassageiro.toFixed(2)}</strong> | Reserva Mínima Exigida: <strong>R$ {reservaMinimaPassageiro.toFixed(2)}</strong>
              </p>
              
              {passageiroAprovado ? (
                <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#064e3b', color: '#6ee7b7', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  ✓ SOLICITAÇÃO AUTORIZADA: Saldo de garantia verificado. O motorista tem recebimento 100% assegurado!
                </div>
              ) : (
                <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#7f1d1d', color: '#fca5a5', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  ⚠️ BLOQUEADO: Saldo inferior à reserva de segurança de R$ {reservaMinimaPassageiro.toFixed(2)}. Adicione saldo em Pix para liberar a chamada.
                </div>
              )}
            </div>

            {/* Simulação de Alteração de Saldo do Passageiro */}
            <div style={{ marginTop: '15px', fontSize: '12px', color: '#94a3b8' }}>
              <span>Simular saldo do passageiro: </span>
              <button onClick={() => setSaldoCarteiraPassageiro(25.00)} style={{ padding: '2px 8px', marginLeft: '5px', borderRadius: '4px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#22c55e', cursor: 'pointer' }}>R$ 25 (Com Saldo)</button>
              <button onClick={() => setSaldoCarteiraPassageiro(5.00)} style={{ padding: '2px 8px', marginLeft: '5px', borderRadius: '4px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#ef4444', cursor: 'pointer' }}>R$ 5 (Sem Saldo)</button>
            </div>

          </div>

          {/* Coluna 2: Visão do Motorista & Ligeirinho */}
          <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
            <h3 style={{ marginTop: 0, color: '#f1f5f9' }}>2. Detalhamento Financeiro do Condutor</h3>
            
            <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
              <p style={{ margin: '0 0 5px 0', color: '#38bdf8', fontWeight: 'bold' }}>{rotaSelecionada.nome}</p>
              <p style={{ margin: '3px 0', fontSize: '13px', color: '#94a3b8' }}>📍 <strong>Embarque Flexível:</strong> {rotaSelecionada.pontoEmbarque}</p>
              
              {eLigeirinhoColetivo && (
                <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#1e293b', border: '1px solid #38bdf8', borderRadius: '6px', fontSize: '12px', color: '#38bdf8' }}>
                  🚘 <strong>Modo Ligeirinho (4 Vagas):</strong> R$ {rotaSelecionada.tarifaColetivo.toFixed(2)} por assento. O motorista inicia ao completar as 4 vagas (R$ 160,00 total).
                </div>
              )}
            </div>

            <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px' }}>
                <span>Faturamento Bruto do Carro:</span>
                <strong style={{ color: '#fff' }}>R$ {faturamentoTotalCarro.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px', color: '#ef4444' }}>
                <span>Taxa da Plataforma ({taxaPlataforma}%):</span>
                <strong>- R$ {valorDescontoPlataforma.toFixed(2)}</strong>
              </div>
              <hr style={{ borderColor: '#334155', margin: '10px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', color: '#22c55e' }}>
                <span>Ganhos Líquidos Garantidos:</span>
                <strong>R$ {valorLiquidoMotorista.toFixed(2)}</strong>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Painel Gestor / Ajustes Gerais */}
      {abaAtiva === 'gestao' && (
        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ marginTop: 0, color: '#38bdf8' }}>Configurações de Segurança e Tarifário Aberto</h3>
          
          {/* Ajuste de Taxas e Saldo de Reserva */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px', marginBottom: '25px' }}>
            
            <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px', border: '1px solid #334155' }}>
              <label style={{ display: 'block', color: '#38bdf8', fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>
                Taxa de Retenção do App: {taxaPlataforma}%
              </label>
              <input 
                type="range" 
                min="0" 
                max="20" 
                step="0.5" 
                value={taxaPlataforma} 
                onChange={(e) => setTaxaPlataforma(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }} 
              />
            </div>

            <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px', border: '1px solid #334155' }}>
              <label style={{ display: 'block', color: '#eab308', fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>
                Reserva Mínima Obrigatória (Passageiro)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#94a3b8' }}>R$</span>
                <input 
                  type="number" 
                  step="5.00" 
                  value={reservaMinimaPassageiro} 
                  onChange={(e) => setReservaMinimaPassageiro(parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: '#1e293b', color: '#fff', border: '1px solid #475569', fontWeight: 'bold' }} 
                />
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '5px' }}>
                * Passageiros com saldo inferior a este valor não conseguem acionar o motorista.
              </span>
            </div>

          </div>

          {/* Tabela de Edição de Valores */}
          <h4 style={{ color: '#f1f5f9', marginBottom: '10px' }}>Tabela Aberta de Valores da Região</h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #334155', color: '#38bdf8' }}>
                  <th style={{ padding: '10px' }}>Rota / Trajeto</th>
                  <th style={{ padding: '10px' }}>Vaga / Assento (R$)</th>
                  <th style={{ padding: '10px' }}>Carro Fechado (R$)</th>
                  <th style={{ padding: '10px' }}>Ponto / Trajeto</th>
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
                    <td style={{ padding: '10px', fontSize: '12px', color: '#94a3b8' }}>{r.pontoEmbarque}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
