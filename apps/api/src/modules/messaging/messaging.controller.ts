import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader, ApiParam } from '@nestjs/swagger';
import { MessagingService } from './messaging.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Messaging & Conversations')
@Controller('conversations')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new conversation (USER_PROVIDER, FRIEND_PRIVATE, GROUP)' })
  async createConversation(@Req() req: any, @Body() dto: CreateConversationDto) {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const activeUserRoleId = req.headers['x-provider-role-id'];
    return this.messagingService.createConversation(req.user.id, dto, activeUserRoleId, ip);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiHeader({
    name: 'x-provider-role-id',
    description: 'Optional active provider role context ID for provider inbox filtering',
    required: false,
  })
  @ApiOperation({ summary: "Get list of authenticated user's conversations" })
  async getUserConversations(@Req() req: any) {
    const activeUserRoleId = req.headers['x-provider-role-id'];
    return this.messagingService.getUserConversations(req.user.id, activeUserRoleId);
  }

  @Get(':id/messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get messages for a conversation (Paginated)' })
  @ApiParam({ name: 'id', description: 'Conversation UUID' })
  async getMessages(
    @Req() req: any,
    @Param('id') conversationId: string,
    @Query() dto: GetMessagesDto,
  ) {
    const activeUserRoleId = req.headers['x-provider-role-id'];
    return this.messagingService.getMessages(conversationId, req.user.id, dto, activeUserRoleId);
  }

  @Post(':id/messages')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send a message in a conversation' })
  @ApiParam({ name: 'id', description: 'Conversation UUID' })
  async sendMessage(
    @Req() req: any,
    @Param('id') conversationId: string,
    @Body() dto: SendMessageDto,
  ) {
    const activeUserRoleId = req.headers['x-provider-role-id'];
    return this.messagingService.sendMessage(conversationId, req.user.id, dto, activeUserRoleId);
  }
}
