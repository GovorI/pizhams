import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ProductsService } from '../src/modules/products/products.service';
import { ProductSize } from '../src/modules/products/entities/product.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const productsService = app.get(ProductsService);

  const sampleProducts = [
    {
      name: 'Пижама "Уютный вечер"',
      description: 'Мягкая и удобная пижама для комфортного отдыха. Изготовлена из натурального хлопка с добавлением эластана для лучшей посадки.',
      price: 2990,
      category: 'Женские',
      sizes: [ProductSize.S, ProductSize.M, ProductSize.L, ProductSize.XL],
      colors: ['Серый', 'Розовый'],
      images: ['data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="500"%3E%3Crect fill="%23CCCCCC" width="400" height="500"/%3E%3Ctext fill="%23666666" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EPizhama 1%3C/text%3E%3C/svg%3E'],
      stock: 25,
    },
    {
      name: 'Пижама "Ночная сказка"',
      description: 'Элегантная пижама из шелковистой ткани. Идеально подходит для особых случаев и создания романтического настроения.',
      price: 3490,
      category: 'Женские',
      sizes: [ProductSize.XS, ProductSize.S, ProductSize.M],
      colors: ['Бордовый', 'Черный'],
      images: ['data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="500"%3E%3Crect fill="%238B0000" width="400" height="500"/%3E%3Ctext fill="%23FFFFFF" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EPizhama 2%3C/text%3E%3C/svg%3E'],
      stock: 15,
    },
    {
      name: 'Пижама "Семейный уют"',
      description: 'Классическая пижама в клетку. Универсальная модель для всей семьи. Дышащая ткань обеспечивает комфорт в любое время года.',
      price: 2490,
      category: 'Унисекс',
      sizes: [ProductSize.M, ProductSize.L, ProductSize.XL, ProductSize.XXL],
      colors: ['Синий', 'Зеленый'],
      images: ['data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="500"%3E%3Crect fill="%2300008B" width="400" height="500"/%3E%3Ctext fill="%23FFFFFF" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EPizhama 3%3C/text%3E%3C/svg%3E'],
      stock: 30,
    },
    {
      name: 'Пижама "Летний бриз"',
      description: 'Лёгкая летняя пижама из тонкого трикотажа. Отлично подходит для жарких ночей. Быстро сохнет и не мнётся.',
      price: 1990,
      category: 'Женские',
      sizes: [ProductSize.S, ProductSize.M, ProductSize.L],
      colors: ['Белый', 'Голубой', 'Персиковый'],
      images: ['data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="500"%3E%3Crect fill="%2387CEEB" width="400" height="500"/%3E%3Ctext fill="%23000000" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EPizhama 4%3C/text%3E%3C/svg%3E'],
      stock: 20,
    },
    {
      name: 'Пижама "Бизнес стиль"',
      description: 'Стильная пижама в деловом стиле. Строгий крой и качественные материалы делают её идеальным выбором для современных женщин.',
      price: 3990,
      category: 'Женские',
      sizes: [ProductSize.XS, ProductSize.S, ProductSize.M, ProductSize.L],
      colors: ['Черный', 'Темно-синий'],
      images: ['data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="500"%3E%3Crect fill="%232F4F4F" width="400" height="500"/%3E%3Ctext fill="%23FFFFFF" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EPizhama 5%3C/text%3E%3C/svg%3E'],
      stock: 18,
    },
    {
      name: 'Пижама "Зимняя сказка"',
      description: 'Тёплая флисовая пижама для холодных зимних вечеров. Мягкий материал сохраняет тепло и создаёт ощущение уюта.',
      price: 3290,
      category: 'Унисекс',
      sizes: [ProductSize.M, ProductSize.L, ProductSize.XL],
      colors: ['Красный', 'Зеленый'],
      images: ['data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="500"%3E%3Crect fill="%23DC143C" width="400" height="500"/%3E%3Ctext fill="%23FFFFFF" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EPizhama 6%3C/text%3E%3C/svg%3E'],
      stock: 22,
    },
    {
      name: 'Шелковая пижама "Роскошь"',
      description: 'Премиальная пижама из натурального шелка. Гипоаллергенная ткань и безупречный крой для максимального комфорта.',
      price: 5990,
      category: 'Женские',
      sizes: [ProductSize.XS, ProductSize.S, ProductSize.M],
      colors: ['Золотой', 'Серебряный'],
      images: ['data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="500"%3E%3Crect fill="%23FFD700" width="400" height="500"/%3E%3Ctext fill="%23000000" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EPizhama 7%3C/text%3E%3C/svg%3E'],
      stock: 10,
    },
    {
      name: 'Пижама "Спорт шик"',
      description: 'Спортивная пижама в стиле casual. Удобный крой и современные материалы для активного образа жизни.',
      price: 2790,
      category: 'Унисекс',
      sizes: [ProductSize.S, ProductSize.M, ProductSize.L, ProductSize.XL],
      colors: ['Серый меланж', 'Черный'],
      images: ['data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="500"%3E%3Crect fill="%23808080" width="400" height="500"/%3E%3Ctext fill="%23FFFFFF" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EPizhama 8%3C/text%3E%3C/svg%3E'],
      stock: 35,
    },
  ];

  console.log('Starting seed...');
  
  for (const productData of sampleProducts) {
    try {
      await productsService.create(productData);
      console.log(`Created: ${productData.name}`);
    } catch (error) {
      console.error(`Error creating ${productData.name}:`, error.message);
    }
  }

  console.log('Seed completed!');
  await app.close();
}

bootstrap();
