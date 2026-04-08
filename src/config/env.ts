/**
 * Environment configuration loader and validator
 * Loads environment variables and provides type-safe access
 */

interface EnvConfig {
  apiUrl: string
  appName: string
  appVersion: string
  environment: 'development' | 'staging' | 'production'
  isDevelopment: boolean
  isProduction: boolean
}

const getEnvVariable = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[`VITE_${key}`]
  if (!value && !defaultValue) {
    console.warn(`Environment variable VITE_${key} is not set`)
    return ''
  }
  return value || defaultValue || ''
}

export const env: EnvConfig = {
  apiUrl: getEnvVariable('API_URL', 'http://localhost:5000/api'),
  appName: getEnvVariable('APP_NAME', 'SchoolOS'),
  appVersion: getEnvVariable('APP_VERSION', '1.0.0'),
  environment: (getEnvVariable('ENVIRONMENT', 'development') as EnvConfig['environment']),
  isDevelopment: getEnvVariable('ENVIRONMENT', 'development') === 'development',
  isProduction: getEnvVariable('ENVIRONMENT', 'development') === 'production',
}

export default env
