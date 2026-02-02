import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PYTHON_SCRIPT_PATH = path.join(__dirname, 'Analytics.py');
const PYTHON_CMD = process.env.PYTHON_CMD || 'py -3.13'; // Windows: py -3.13, Linux/Mac: python3

/**
 * Ejecuta el script de Python Analytics.py y devuelve las métricas calculadas.
 * @returns {Promise<Object>} Objeto con todas las métricas calculadas
 */
export async function getAnalytics() {
  try {
    // Ejecutar Python con --json para obtener solo JSON
    const { stdout, stderr } = await execAsync(
      `${PYTHON_CMD} "${PYTHON_SCRIPT_PATH}" --json`,
      { cwd: __dirname }
    );

    if (stderr && !stderr.includes('Warning')) {
      console.error('Python stderr:', stderr);
    }

    // Parsear JSON desde stdout
    const analytics = JSON.parse(stdout.trim());
    return analytics;
  } catch (error) {
    console.error('Error ejecutando Analytics.py:', error);
    throw new Error(`Error al calcular analytics: ${error.message}`);
  }
}

/**
 * Obtiene solo la suma total de totalPrice de todas las órdenes.
 * @returns {Promise<{sumTotalPrice: number, count: number}>}
 */
export async function getOrdersTotal() {
  const analytics = await getAnalytics();
  return {
    sumTotalPrice: analytics.orders.sumTotalPrice,
    count: analytics.orders.count,
  };
}
