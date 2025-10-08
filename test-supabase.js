const { createClient } = require('@supabase/supabase-js');

// Читаем переменные из .env.local файла вручную
const fs = require('fs');
const path = require('path');

let supabaseUrl, supabaseKey;

try {
  const envContent = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
  const lines = envContent.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim();
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.split('=')[1].trim();
    }
  }
} catch (error) {
  console.log('❌ Error reading .env.local file:', error.message);
}

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Supabase credentials not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test categories
    const { data: categories, error: catError } = await supabase
      .from('lesson_categories')
      .select('*')
      .limit(5);
    
    if (catError) {
      console.log('❌ Error fetching categories:', catError.message);
    } else {
      console.log('✅ Categories table:', categories?.length || 0, 'records');
      if (categories?.length > 0) {
        console.log('   Sample category:', categories[0].name);
      }
    }
    
    // Test lessons
    const { data: lessons, error: lessonError } = await supabase
      .from('lessons')
      .select('*')
      .limit(5);
    
    if (lessonError) {
      console.log('❌ Error fetching lessons:', lessonError.message);
    } else {
      console.log('✅ Lessons table:', lessons?.length || 0, 'records');
      if (lessons?.length > 0) {
        console.log('   Sample lesson:', lessons[0].title);
      }
    }
    
    // Test view
    const { data: categoriesWithCounts, error: viewError } = await supabase
      .from('categories_with_counts')
      .select('*')
      .limit(3);
    
    if (viewError) {
      console.log('❌ Error fetching categories view:', viewError.message);
    } else {
      console.log('✅ Categories view:', categoriesWithCounts?.length || 0, 'records');
      if (categoriesWithCounts?.length > 0) {
        console.log('   Sample with counts:', categoriesWithCounts[0].name, 'published:', categoriesWithCounts[0].published_lesson_count);
      }
    }
    
    console.log('\n🎉 Supabase database setup completed successfully!');
    
  } catch (error) {
    console.log('❌ Connection test failed:', error.message);
  }
}

testConnection();