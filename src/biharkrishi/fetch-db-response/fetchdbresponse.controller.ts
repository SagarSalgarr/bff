import { Controller, BadRequestException, UseGuards, Body, Post } from '@nestjs/common';
import { QuestionsService } from './fetchdbresponse.service';
import { ApiKeyGuard } from 'src/auth/api-key.guard';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @UseGuards(ApiKeyGuard)
  @Post('fetchdbresponse')
  async fetchDbResponse(@Body() body: { question: string; schemeName: string }) {
    const { question, schemeName } = body;
    if (!question) {
      throw new BadRequestException('The question field in the body is required.');
    }
    if (!schemeName || !schemeName.trim()) {
      throw new BadRequestException('The scheme name must be provided.');
    }
    return await this.questionsService.fetchResponse(question, schemeName);
  }
}