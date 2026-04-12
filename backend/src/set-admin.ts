import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/modules/users/users.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  try {
    const user = await usersService.findByEmail('admin@pizhams.local');
    if (user) {
      const { id } = user;
      await app
        .get(require('typeorm').DataSource)
        .transaction(async (manager) => {
          await manager.query(`UPDATE users SET role = 'admin' WHERE id = $1`, [
            id,
          ]);
        });
      console.log(`User ${user.email} is now admin!`);
    } else {
      console.log('User not found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }

  await app.close();
}

bootstrap();
