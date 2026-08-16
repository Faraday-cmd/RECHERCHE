import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { HeaderResolver, I18nModule, AcceptLanguageResolver } from 'nestjs-i18n';
import * as path from 'path';
import * as fs from 'fs';
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
import { EmailModule } from './modules/email/email.module';

const getI18nPath = () => {
  const possiblePaths = [
    path.join(__dirname, 'i18n'),
    path.join(process.cwd(), 'apps/api/src/i18n'),
    path.join(process.cwd(), 'src/i18n'),
    path.join(__dirname, '../src/i18n'),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) {
      return p;
    }
  }

  // Safe fallback directory preventing nestjs-i18n JSON parse syntax errors on Lambda
  const safeTmp = path.join(process.cwd(), '.temp_i18n');
  if (!fs.existsSync(safeTmp)) {
    try {
      fs.mkdirSync(safeTmp, { recursive: true });
      fs.writeFileSync(path.join(safeTmp, 'fr.json'), '{}');
    } catch {}
  }
  return safeTmp;
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
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
        path: getI18nPath(),
        watch: false,
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
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
