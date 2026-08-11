import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { HeaderResolver, I18nModule, AcceptLanguageResolver } from 'nestjs-i18n';
import * as path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validateEnv } from './config/env.schema';
import { PrismaModule } from './prisma/prisma.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { ProviderModule } from './modules/provider/provider.module';
import { FollowModule } from './modules/follow/follow.module';
import { InfoModule } from './modules/info/info.module';
import { CourseModule } from './modules/course/course.module';
import { SearchModule } from './modules/search/search.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { SocialModule } from './modules/social/social.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    I18nModule.forRoot({
      fallbackLanguage: 'fr',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        new HeaderResolver(['x-custom-lang']),
        AcceptLanguageResolver,
      ],
    }),
    PrismaModule,
    AuditModule,
    AuthModule,
    UserModule,
    SubscriptionModule,
    ProviderModule,
    FollowModule,
    InfoModule,
    CourseModule,
    SearchModule,
    MessagingModule,
    SocialModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
