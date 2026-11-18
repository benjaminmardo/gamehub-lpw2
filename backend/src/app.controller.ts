import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
@ApiTags('Estado')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get()
  @ApiOperation({ summary: 'Consultar respuesta del scaffold', description: 'Controlador de ejemplo; disponible únicamente si AppModule lo registra.' })
  @ApiResponse({ status: 200, description: 'Saludo del scaffold', type: String })
  getHello(): string { return this.appService.getHello(); }
}
