import React, { useState } from 'react';
import { Music, Upload, Loader2, Search, AlertCircle, Repeat, TrendingUp, Target, Brain, Activity, Calendar } from 'lucide-react';

const SheetMusicAnalyzer = () => {
  const [image, setImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  const promptRAG = `Analiza esta partitura identificando TODOS los patrones melódicos y rítmicos.

Responde SOLO con JSON válido (sin markdown):

{
  "informacion_basica": {
    "tonalidad": "string",
    "compas": "string",
    "tempo": "string",
    "clave": "string",
    "total_compases": number,
    "estructura": "string"
  },
  "patrones_melodicos": [
    {
      "nombre": "string",
      "notas_aproximadas": "string",
      "compases": "string",
      "repeticiones": number,
      "tipo": "escala/arpegio/secuencia/motivo/cromatismo/salto/ornamento",
      "intervalos": "string",
      "direccion": "ascendente/descendente/ondulante",
      "importancia": "string",
      "dificultad_patron": "fácil/medio/difícil",
      "como_practicar": "string",
      "velocidad_sugerida": "string"
    }
  ],
  "patrones_ritmicos": [
    {
      "nombre": "string",
      "figura_ritmica": "string",
      "compases": "string",
      "repeticiones": number,
      "dificultad": "fácil/medio/difícil"
    }
  ],
  "analisis_intervalico": {
    "intervalos_mas_usados": ["string"],
    "saltos_grandes": ["string"],
    "cromatismos": ["string"],
    "patron_intervalico_dominante": "string"
  },
  "nivel_dificultad": {
    "general": "principiante/intermedio/avanzado/experto",
    "tecnica": number,
    "lectura": number,
    "musicalidad": number,
    "razones": ["string"]
  },
  "caracteristicas_tecnicas": {
    "alteraciones_armadura": ["string"],
    "figuras_predominantes": ["string"],
    "tecnicas_requeridas": ["string"],
    "articulaciones": ["string"],
    "dinamicas": ["string"]
  },
  "fragmentos_criticos": [
    {
      "compases": "string",
      "descripcion": "string",
      "tipo_dificultad": "string",
      "como_practicar": "string",
      "ejercicios_preparatorios": "string"
    }
  ],
  "plan_de_estudio": {
    "semana_1": ["string"],
    "semana_2": ["string"],
    "semana_3": ["string"],
    "semana_4": ["string"]
  },
  "ejercicios_tecnicos": ["string"],
  "consejos_practica": ["string"],
  "contexto_musical": {
    "compositor": "string",
    "periodo": "string",
    "estilo": "string",
    "obras_similares": ["string"]
  }
}`;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
        setError('');
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeSheet = async () => {
    if (!image) {
      setError('Por favor sube una imagen de la partitura');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      const base64Image = image.split(',')[1];
      const mediaType = image.split(';')[0].split(':')[1];

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 8000,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: mediaType, data: base64Image }
              },
              { type: 'text', text: promptRAG }
            ]
          }]
        })
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const data = await response.json();
      const text = data.content.filter(i => i.type === 'text').map(i => i.text).join('\n').trim();
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      setAnalysis(JSON.parse(cleanText));
      
    } catch (err) {
      console.error('Error:', err);
      setError('Error al analizar. Verifica que la imagen sea clara.');
    } finally {
      setAnalyzing(false);
    }
  };

  const InfoCard = ({ label, value }) => (
    <div className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-indigo-400">
      <div className="text-xs text-gray-600 mb-1">{label}</div>
      <div className="text-base font-bold text-indigo-600">{value || 'N/A'}</div>
    </div>
  );

  const PatternCard = ({ patron, index }) => {
    const colors = ['blue', 'green', 'purple', 'orange', 'pink', 'cyan', 'red', 'indigo'];
    const color = colors[index % colors.length];
    const icons = {
      'escala': '📊', 'arpegio': '🎼', 'secuencia': '🔄',
      'motivo': '🎵', 'cromatismo': '🌈', 'salto': '⬆️', 'ornamento': '✨'
    };
    
    return (
      <div className={`p-4 rounded-lg border-2 border-${color}-500 bg-${color}-50 shadow-md`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{icons[patron.tipo?.toLowerCase()] || '🎵'}</span>
              <div>
                <h3 className="text-lg font-bold text-gray-800">{patron.nombre}</h3>
                <div className="flex gap-2 mt-1">
                  <span className="bg-white px-2 py-0.5 rounded-full text-xs font-semibold text-gray-600">
                    {patron.tipo}
                  </span>
                  <span className="bg-white px-2 py-0.5 rounded-full text-xs font-semibold text-gray-600">
                    {patron.direccion}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg mb-2 shadow-sm">
              <p className="text-xs text-gray-600">Patrón:</p>
              <p className="text-sm font-mono font-bold text-indigo-700">{patron.notas_aproximadas}</p>
              {patron.intervalos && (
                <p className="text-xs text-gray-600 mt-1">Intervalos: <span className="font-semibold text-purple-600">{patron.intervalos}</span></p>
              )}
            </div>
          </div>
          <div className="ml-3 text-center bg-white px-3 py-2 rounded-lg shadow-md">
            <div className="text-2xl font-bold text-purple-600">{patron.repeticiones}x</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <p className="text-xs font-semibold text-gray-700">📍 {patron.compases}</p>
          </div>
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <p className="text-xs font-semibold text-orange-700 capitalize">{patron.dificultad_patron}</p>
          </div>
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <p className="text-xs font-semibold text-green-700">{patron.velocidad_sugerida}</p>
          </div>
        </div>
        <div className="bg-blue-100 border-l-4 border-blue-500 p-2 rounded-lg mb-2">
          <p className="text-xs font-semibold text-blue-900">⭐ {patron.importancia}</p>
        </div>
        <div className="bg-green-100 border-l-4 border-green-500 p-2 rounded-lg">
          <p className="text-xs font-semibold text-green-900">💡 {patron.como_practicar}</p>
        </div>
      </div>
    );
  };

  const getDifficultyColor = (level) => {
    const colors = {
      'principiante': 'bg-green-100 text-green-800 border-green-300',
      'intermedio': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'avanzado': 'bg-orange-100 text-orange-800 border-orange-300',
      'experto': 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[level?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Music className="w-10 h-10 text-indigo-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Análisis Musical RAG</h1>
            <p className="text-gray-600 text-sm">Sistema optimizado con IA</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-500 p-4 mb-4 rounded-lg">
          <h3 className="font-bold text-indigo-900 mb-2">🎯 Análisis Completo</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs text-indigo-800">
            <div className="bg-white p-2 rounded">🎼 Patrones melódicos</div>
            <div className="bg-white p-2 rounded">🥁 Patrones rítmicos</div>
            <div className="bg-white p-2 rounded">📊 Análisis intervalos</div>
            <div className="bg-white p-2 rounded">📅 Plan de estudio</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border-4 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors">
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="file-upload" />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-base font-semibold text-gray-700 mb-1">Sube tu partitura</p>
              <p className="text-xs text-gray-500">JPG, PNG - Imagen clara</p>
            </label>
          </div>

          {image && (
            <div className="bg-gray-50 rounded-xl p-3 border-2 border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-2 text-sm">Partitura cargada:</h3>
              <img src={image} alt="Partitura" className="max-h-80 mx-auto rounded-lg shadow-md" />
            </div>
          )}

          <button onClick={analyzeSheet} disabled={!image || analyzing}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg disabled:cursor-not-allowed">
            {analyzing ? (
              <><Loader2 className="w-5 h-5 animate-spin" />Analizando...</>
            ) : (
              <><Search className="w-5 h-5" />Analizar Partitura</>
            )}
          </button>

          {error && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 font-medium text-sm">{error}</p>
            </div>
          )}
        </div>

        {analysis && (
          <div className="mt-6 space-y-4">
            {/* Información Básica */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-indigo-200">
              <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Music className="w-5 h-5" />Información Básica
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <InfoCard label="Tonalidad" value={analysis.informacion_basica?.tonalidad} />
                <InfoCard label="Compás" value={analysis.informacion_basica?.compas} />
                <InfoCard label="Tempo" value={analysis.informacion_basica?.tempo} />
                <InfoCard label="Clave" value={analysis.informacion_basica?.clave} />
                <InfoCard label="Compases" value={analysis.informacion_basica?.total_compases} />
              </div>
            </div>

            {/* Patrones Melódicos */}
            {analysis.patrones_melodicos?.length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-300">
                <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Repeat className="w-6 h-6 text-purple-600" />
                  Patrones Melódicos: {analysis.patrones_melodicos.length}
                </h2>
                <div className="space-y-3">
                  {analysis.patrones_melodicos.map((patron, idx) => (
                    <PatternCard key={idx} patron={patron} index={idx} />
                  ))}
                </div>
              </div>
            )}

            {/* Patrones Rítmicos */}
            {analysis.patrones_ritmicos?.length > 0 && (
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border-2 border-emerald-300">
                <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Activity className="w-6 h-6 text-emerald-600" />
                  Patrones Rítmicos: {analysis.patrones_ritmicos.length}
                </h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {analysis.patrones_ritmicos.map((patron, idx) => (
                    <div key={idx} className="p-4 rounded-lg border-2 border-emerald-500 bg-emerald-50 shadow-md">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">🥁</span>
                        <h3 className="text-lg font-bold text-gray-800">{patron.nombre}</h3>
                      </div>
                      <div className="bg-white p-3 rounded-lg mb-2 shadow-sm">
                        <p className="text-xs text-gray-600">Figura:</p>
                        <p className="text-sm font-mono font-bold text-emerald-700">{patron.figura_ritmica}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                          <p className="text-xs text-gray-600">Compases:</p>
                          <p className="text-xs font-bold text-emerald-700">{patron.compases}</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                          <p className="text-xs text-gray-600">Rep:</p>
                          <p className="text-xs font-bold text-purple-600">{patron.repeticiones}x</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nivel de Dificultad */}
            {analysis.nivel_dificultad && (
              <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />Nivel de Dificultad
                </h2>
                <div className={`inline-block px-4 py-2 rounded-full border-2 text-base font-bold mb-3 ${getDifficultyColor(analysis.nivel_dificultad.general)}`}>
                  {analysis.nivel_dificultad.general?.toUpperCase()}
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                    <p className="text-xs text-gray-600 mb-1">Técnica</p>
                    <p className="text-xl font-bold text-blue-600">{analysis.nivel_dificultad.tecnica}/10</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-400">
                    <p className="text-xs text-gray-600 mb-1">Lectura</p>
                    <p className="text-xl font-bold text-purple-600">{analysis.nivel_dificultad.lectura}/10</p>
                  </div>
                  <div className="bg-pink-50 p-3 rounded-lg border-l-4 border-pink-400">
                    <p className="text-xs text-gray-600 mb-1">Musicalidad</p>
                    <p className="text-xl font-bold text-pink-600">{analysis.nivel_dificultad.musicalidad}/10</p>
                  </div>
                </div>
              </div>
            )}

            {/* Fragmentos Críticos */}
            {analysis.fragmentos_criticos?.length > 0 && (
              <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-300">
                <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5" />Fragmentos Críticos
                </h2>
                <div className="space-y-3">
                  {analysis.fragmentos_criticos.map((f, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-lg border-l-4 border-yellow-500 shadow-sm">
                      <span className="bg-yellow-200 px-2 py-1 rounded-full font-bold text-xs">Compases {f.compases}</span>
                      <p className="text-gray-800 text-sm mt-2"><strong className="text-red-700">⚠️ Problema:</strong> {f.descripcion}</p>
                      <div className="bg-green-50 border-l-4 border-green-500 p-2 rounded mt-2">
                        <p className="text-green-800 text-sm"><strong>💡 Solución:</strong> {f.como_practicar}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Plan de Estudio */}
            {analysis.plan_de_estudio && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-300">
                <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />Plan de Estudio
                </h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {['semana_1', 'semana_2', 'semana_3', 'semana_4'].map((semana, idx) => (
                    analysis.plan_de_estudio[semana] && (
                      <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
                        <h3 className="font-bold text-green-900 mb-2 text-sm">📅 Semana {idx + 1}</h3>
                        <ul className="space-y-1">
                          {analysis.plan_de_estudio[semana].map((objetivo, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                              <span className="text-green-600">✓</span>
                              <span>{objetivo}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Consejos */}
            {analysis.consejos_practica?.length > 0 && (
              <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-300">
                <h2 className="text-xl font-bold text-gray-800 mb-3">💡 Consejos de Práctica</h2>
                <ul className="space-y-2">
                  {analysis.consejos_practica.map((consejo, idx) => (
                    <li key={idx} className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-purple-400 text-gray-700 text-sm">
                      {consejo}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SheetMusicAnalyzer;