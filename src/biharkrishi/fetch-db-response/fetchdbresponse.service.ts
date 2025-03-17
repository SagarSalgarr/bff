import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "src/global-services/prisma.service";

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  async fetchResponse(
    userQuestion: string,
    schemeName: string
  ): Promise<{
    question: string;
    response: string;
    intent: string;
    schemeId: number;
    schemeName: string;
  }> {
    // Ensure that a scheme name is provided by the API caller.
    if (!schemeName || !schemeName.trim()) {
      throw new BadRequestException('Scheme name must be provided.');
    }
    
    // Step 1: Look for a MainQuestion matching the question and scheme.
    const mainQuestion = await this.prisma.mainQuestion.findFirst({
      where: {
        question: userQuestion,
        scheme: {
          name: schemeName,
        },
      },
      select: {
        question: true,
        response: true,
        intent: true,
        schemeId: true,
        scheme: { select: { name: true } },
      },
    });

    if (mainQuestion && mainQuestion.scheme) {
      return {
        question: mainQuestion.question,
        response: mainQuestion.response,
        intent: mainQuestion.intent,
        schemeId: mainQuestion.schemeId,
        schemeName: mainQuestion.scheme.name,
      };
    }

    // Step 2: If no main question match, look for a Variation that matches.
    const variation = await this.prisma.variations.findFirst({
      where: {
        variation: userQuestion,
        mainQuestion: {
          scheme: {
            name: schemeName,
          },
        },
      },
      select: {
        mainQuestion: {
          select: {
            question: true,
            response: true,
            intent: true,
            schemeId: true,
            scheme: { select: { name: true } },
          },
        },
      },
    });

    if (variation && variation.mainQuestion && variation.mainQuestion.scheme) {
      const mq = variation.mainQuestion;
      return {
        question: mq.question,
        response: mq.response,
        intent: mq.intent,
        schemeId: mq.schemeId,
        schemeName: mq.scheme.name,
      };
    }

    // Step 3: If no match is found, throw an error.
    throw new NotFoundException("No matching question found in the database.");
  }
}
