import 'reflect-metadata'
import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import type { Env } from './config/env'

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create(AppModule)
	const config = app.get(ConfigService<Env, true>)

	app.enableCors({
		origin: [config.get('FRONTEND_ORIGIN', { infer: true })],
		allowedHeaders: ['Content-Type', 'Authorization'],
		credentials: false,
	})

	const swaggerConfig = new DocumentBuilder()
		.setTitle('Support Agent Backend')
		.setVersion('0.1.0')
		.build()
	const document = SwaggerModule.createDocument(app, swaggerConfig)
	SwaggerModule.setup('docs', app, document)

	const port = config.get('PORT', { infer: true })
	await app.listen(port)
	new Logger('Bootstrap').log({
		actionCode: 'app.bootstrap.listen.ready',
		port,
		docsPath: '/docs',
	})
}

bootstrap()
