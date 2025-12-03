// Utilitário para testar conexão com Supabase
import { supabase } from '@/lib/supabase'

export async function testSupabaseConnection() {
  try {
    console.log('🔍 Testando conexão com Supabase...')
    
    // Teste 1: Verificar se consegue acessar o Supabase
    const { data: healthCheck, error: healthError } = await supabase
      .from('tenants')
      .select('count')
      .limit(1)
    
    if (healthError && healthError.code !== 'PGRST116') {
      // PGRST116 é "no rows returned", que é OK
      console.error('❌ Erro na conexão:', healthError)
      return { success: false, error: healthError.message }
    }
    
    console.log('✅ Conexão com Supabase estabelecida!')
    
    // Teste 2: Verificar se as tabelas existem
    const tables = [
      'tenants',
      'users',
      'professionals',
      'services',
      'clients',
      'appointments',
      'transactions',
      'campaigns',
      'notifications'
    ]
    
    const tableChecks = await Promise.all(
      tables.map(async (table) => {
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        return {
          table,
          exists: !error || error.code === 'PGRST116'
        }
      })
    )
    
    const missingTables = tableChecks.filter(t => !t.exists)
    
    if (missingTables.length > 0) {
      console.warn('⚠️ Algumas tabelas não foram encontradas:', missingTables.map(t => t.table))
    } else {
      console.log('✅ Todas as tabelas foram criadas corretamente!')
    }
    
    return {
      success: true,
      tables: tableChecks,
      message: 'Conexão estabelecida com sucesso!'
    }
  } catch (error: any) {
    console.error('❌ Erro ao testar conexão:', error)
    return {
      success: false,
      error: error.message
    }
  }
}


