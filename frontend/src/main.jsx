import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

// Tabela base de Linhas e Rotas do Hub de Alagoinhas
const ROTAS_ALAGOINHAS_INICIAL = [
  // --- LIMITES URBANOS ---
  { id: 1, nome: "Mangalô / Santa Terezinha ↔ Centro", categoria: "Urbana", tipo: "Urbano / Bairro", tarifaColetivo: 4.00, tarifaExclusivo: 18.00, detalheHorario: "A cada 10-15 min" },
  { id: 2, nome: "Alagoinhas Velha / Praça Kennedy ↔ Centro", categoria: "Urbana", tipo: "Urbano / Bairro", tarifaColetivo: 4.50, tarifaExclusivo: 18.00, detalheHorario: "A cada 10 min" },
  { id: 3, nome: "Nova Brasília / FM ↔ Centro (Limite Urbano)", categoria: "Urbana", tipo: "Urbano / Bairro", tarifaColetivo: 4.50, tarifaExclusivo: 20.00, detalheHorario: "A cada 12 min" },
  { id: 4, nome: "Urupiara / Barreiro / Teresópolis ↔ Centro", categoria: "Urbana", tipo: "Urbano / Bairro", tarifaColetivo: 4.50, tarifaExclusivo: 20.00, detalheHorario: "A cada 10 min" },

  // --- DISTRITAIS RURAIS ---
  { id: 5, nome: "Fazenda Catuzinho ↔ Centro", categoria: "Distrital", tipo: "Povoado / Rural", tarifaColetivo: 4.50, tarifaExclusivo: 25.00, detalheHorario: "06:00 | 11:30 | 17:00" },
  { id: 6, nome: "Boa União ↔ Centro", categoria: "Distrital", tipo: "Povoado / Rural", tarifaColetivo: 5.50, tarifaExclusivo: 30.00, detalheHorario: "06:00 | 08:00 | 11:30 | 14:00 | 17:30" },
  { id: 7, nome: "Estêvão ↔ Centro", categoria: "Distrital", tipo: "Povoado / Rural", tarifaColetivo: 5.00, tarifaExclusivo: 28.00, detalheHorario: "06:15 | 09:00 | 12:00 | 16:30 | 18:15" },
  { id: 8, nome: "Riacho da Guia / Calu ↔ Transbordo", categoria: "Distrital", tipo: "Distrito / Rural", tarifaColetivo: 7.00, tarifaExclusivo: 45.00, detalheHorario: "05:30 | 11:30 | 16:30" },

  // --- INTERMUNICIPAIS REGIONAIS ---
  { id: 9, nome: "Pedrão ↔ Alagoinhas (Eixo Feira)", categoria: "Intermunicipal", tipo: "Regional", tarifaColetivo: 9.00, tarifaExclusivo: 60.00, detalheHorario: "06:00 | 08:30 | 11:30 | 14:30 | 17:00" },
  { id: 10, nome: "Aramari ↔ Alagoinhas", categoria: "Intermunicipal", tipo: "Regional", tarifaColetivo: 6.00, tarifaExclusivo: 35.00, detalheHorario: "06:30 | 07:30 | 10:00 | 13:00 | 16:00 | 18:00" },
  { id: 11, nome: "Catu / Pojuca ↔ Alagoinhas", categoria: "Intermunicipal", tipo: "Regional", tarifaColetivo: 8.50, tarifaExclusivo: 55.00, detalheHorario: "05:40 | 07:00 | 09:30 | 12:30 | 15:30 | 17:40" },

  // --- LITORAL NORTE ---
  { id: 12, nome: "Porto de Sauípe / Subaúma ↔ Transbordo", categoria: "Litoral", tipo: "Litoral / Turismo", tarifaColetivo: 14.00, tarifaExclusivo: 120.00, detalheHorario: "06:00 | 10:30 | 14:00 | 17:00" }
];

function App() {
  const [abaAtiva, setAbaAtiva] = useState('passageiro');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [idRotaSelecionada, setIdRotaSelecionada] = useState(5); // Padrão: Fazenda Catuzinho
  const [modalidade, setModalidade] = useState('coletivo'); // 'coletivo' ou 'exclusivo'
  
  // Taxa de Intermediação Ajustável do App
  const [taxaPlataforma, setTaxaPlataforma] = useState(10); 
  
  // Lista de rotas personalizáveis
  const [rotas, setRotas] = useState(ROTAS_ALAGOINHAS_INICIAL);

  const rotaSelecionada = rotas.find(r => r.id === Number(idRotaSelecionada)) || rotas[0];

  // Cálculo da tarifa com base na modalidade escolhida
  const tarifaBaseCalculada = modalidade === 'coletivo' ? rotaSelecionada.tarifaColetivo : rotaSelecionada.tarifaExclusivo;
  
  // Repasse do app
  const valorDesconto = (tarifaBaseCalculada * taxaPlataforma) / 100;
  const valorLiquidoMotorista = tarifaBaseCalculada - valorDesconto;

  // Função para editar valor de tarifa aberto
  const atualizarTarifa = (id, campo, novoValor) => {
    const val = parseFloat(novoValor) || 0;
    setRotas(rotas.map(r => r.id === id ? { ...r, [campo]: val } : r));
  };

  const rotasFiltradas = categoriaFiltro === 'Todas' 
    ? rotas 
    : rotas.filter(r => r.categoria === categoriaFiltro);

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', padding: '20px' }}>
      
      {/* Cabeçalho */}
      <header style={{ borderBottom: '1px solid #334155', paddingBottom: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#38bdf8', margin: 0, fontSize: '24px' }}>Alagoinhas Mobilidade</h1>
          <p style={{ color: '#94a3b8', margin: '5px 0 0 0', fontSize: '14px' }}>Gestão de Tarifas: Coletivo, Ligeirinho e Carro Exclusivo</p>
        </div>
        <span style={{ backgroundColor: '#0284c7', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
          Tarifário Aberto
        </span>
      </header>

      {/* Navegação */}
      <nav style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
        <button onClick={() => setAbaAtiva('passageiro')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: abaAtiva === 'passageiro' ? '#38bdf8' : '#1e293b', color: abaAtiva === 'passageiro' ? '#0f172a' : '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
          Simulador & Modalidade
        </button>
        <button onClick={() => setAbaAtiva('rotas')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: abaAtiva === 'rotas' ? '#38bdf8' : '#1e293b', color: abaAtiva === 'rotas' ? '#0f172a' : '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
          Quadro Geral & Edição de Tarifas
        </button>
      </nav>

      {/* Conteúdo Consulta */}
      {abaAtiva === 'passageiro' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          
          <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
            <h3 style={{ marginTop: 0, color: '#f1f5f9' }}>1. Selecione o Trajeto e Modalidade</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '5px' }}>DESTINO / LINHA</label>
              <select value={idRotaSelecionada} onChange={(e) => setIdRotaSelecionada(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569' }}>
                {rotas.map(r => (
                  <option key={r.id} value={r.id}>{r.nome} ({r.categoria})</option>
                ))}
              </select>
            </div>

            {/* Alternador Coletivo vs Exclusivo */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '5px' }}>TIPO DE EMBARQUE</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => setModalidade('coletivo')}
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #38bdf8', backgroundColor: modalidade === 'coletivo' ? '#0284c7' : '#0f172a', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
                  👥 Compartilhado / Vaga
                </button>
                <button 
                  onClick={() => setModalidade('exclusivo')}
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #eab308', backgroundColor: modalidade === 'exclusivo' ? '#ca8a04' : '#0f172a', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
                  🚗 Carro Fechado (Particular)
                </button>
              </div>
            </div>

            {/* Exibição em Tempo Real */}
            <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px', borderLeft: modalidade === 'coletivo' ? '4px solid #38bdf8' : '4px solid #eab308' }}>
              <h4 style={{ margin: '0 0 5px 0', color: '#f8fafc' }}>{rotaSelecionada.nome}</h4>
              <p style={{ margin: '3px 0', fontSize: '13px', color: '#cbd5e1' }}>
                <strong>Modalidade Escolhida:</strong> {modalidade === 'coletivo' ? 'Passagem Coletiva / Por Pessoa' : 'Carro Exclusivo / Fechado'}
              </p>
              <p style={{ margin: '8px 0 0 0', fontSize: '18px', color: '#22c55e', fontWeight: 'bold' }}>
                Valor Final: R$ {tarifaBaseCalculada.toFixed(2)}
              </p>
            </div>

          </div>

          {/* Controle da Taxa e Repasse Líquido */}
          <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
            <h3 style={{ marginTop: 0, color: '#f1f5f9' }}>2. Divisão e Retenção do App</h3>
            
            <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
              <label style={{ display: 'block', color: '#38bdf8', fontWeight: 'bold', fontSize: '14px', marginBottom: '10px' }}>
                Taxa de Serviço da Plataforma: {taxaPlataforma}% (Ajustável)
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
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginTop: '5px' }}>
                <span>0% (Isento)</span>
                <span>10% (Padrão)</span>
                <span>20% (Teto)</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 8px 0', color: '#94a3b8', fontSize: '13px' }}>Detalhamento Financeiro:</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px' }}>
                <span>Valor Cobrado ao Passageiro:</span>
                <strong style={{ color: '#fff' }}>R$ {tarifaBaseCalculada.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px', color: '#ef4444' }}>
                <span>Retenção App ({taxaPlataforma}%):</span>
                <strong>- R$ {valorDesconto.toFixed(2)}</strong>
              </div>
              <hr style={{ borderColor: '#334155', margin: '10px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', color: '#22c55e' }}>
                <span>Repasse Líquido ao Motorista:</span>
                <strong>R$ {valorLiquidoMotorista.toFixed(2)}</strong>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Tabela Editável de Tarifas */}
      {abaAtiva === 'rotas' && (
        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
            <h3 style={{ margin: 0 }}>Quadro de Tarifas Ajustáveis de Alagoinhas e Região</h3>
            
            {/* Filtros */}
            <div style={{ display: 'flex', gap: '5px' }}>
              {['Todas', 'Urbana', 'Distrital', 'Intermunicipal', 'Litoral'].map((cat) => (
                <button 
                  key={cat}
                  onClick={() => setCategoriaFiltro(cat)}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: categoriaFiltro === cat ? '#0284c7' : '#0f172a', color: '#fff', fontSize: '12px', cursor: 'pointer' }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: 0 }}>
            * Você pode alterar os valores de <strong>Coletivo</strong> e <strong>Carro Particular Exclusivo</strong> diretamente nos campos abaixo.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #334155', color: '#38bdf8' }}>
                  <th style={{ padding: '10px' }}>Linha / Trajeto</th>
                  <th style={{ padding: '10px' }}>Categoria</th>
                  <th style={{ padding: '10px' }}>Tarifa Coletiva (R$)</th>
                  <th style={{ padding: '10px' }}>Carro Exclusivo (R$)</th>
                  <th style={{ padding: '10px' }}>Horários / Saída</th>
                </tr>
              </thead>
              <tbody>
                {rotasFiltradas.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{r.nome}</td>
                    <td style={{ padding: '10px', color: '#94a3b8' }}>{r.categoria}</td>
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
                    <td style={{ padding: '10px', fontSize: '13px', color: '#94a3b8' }}>{r.detalheHorario}</td>
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
