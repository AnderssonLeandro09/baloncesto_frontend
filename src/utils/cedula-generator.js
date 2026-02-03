/**
 * Generador de cédulas ecuatorianas válidas
 * Útil para pruebas y desarrollo
 */

/**
 * Genera una cédula ecuatoriana válida
 * @param {number} provincia - Código de provincia (1-24)
 * @returns {string} Cédula de 10 dígitos
 */
export function generateValidCedula(provincia = 1) {
  // Asegurar que la provincia sea válida (01-24)
  const prov = String(Math.max(1, Math.min(24, provincia))).padStart(2, '0')
  
  // Segundo dígito: 0-5 (0 para personas)
  const segundo = '0'
  
  // Tercer dígito: 0-9 (menos de 6 para personas)
  const tercero = '0'
  
  // Generar 6 dígitos aleatorios
  const digitos = Array(6)
    .fill(0)
    .map(() => Math.floor(Math.random() * 10))
    .join('')
  
  // Primeros 9 dígitos
  const primeroNueve = prov + segundo + tercero + digitos
  
  // Calcular dígito verificador (módulo 10)
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2]
  let suma = 0
  
  for (let i = 0; i < 9; i++) {
    let valor = parseInt(primeroNueve[i]) * coeficientes[i]
    if (valor >= 10) valor -= 9
    suma += valor
  }
  
  const verificador = suma % 10 === 0 ? 0 : 10 - (suma % 10)
  
  return primeroNueve + verificador
}

/**
 * Cédulas de prueba válidas predefinidas
 */
export const CEDULAS_PRUEBA = [
  '0201234561', // Provincia Azuay
  '0401234563', // Provincia Cotopaxi
  '0601234564', // Provincia Tungurahua
  '0801234565', // Provincia Imbabura
  '1001234567', // Provincia Pichincha
  '1201234568', // Provincia Manabí
  '1401234569', // Provincia Santa Elena
  '1601234560', // Provincia Pastaza
  '1801234561', // Provincia Zamora
  '2001234562', // Provincia Napo
]

/**
 * Obtiene una cédula de prueba aleatoria
 * @returns {string} Cédula válida para pruebas
 */
export function getRandomTestCedula() {
  return CEDULAS_PRUEBA[Math.floor(Math.random() * CEDULAS_PRUEBA.length)]
}

/**
 * Obtiene la primera cédula de prueba
 * @returns {string} Primera cédula válida predefinida
 */
export function getFirstTestCedula() {
  return CEDULAS_PRUEBA[0]
}
