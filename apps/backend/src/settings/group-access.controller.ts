import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GroupAccessService } from '../group-access/group-access.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UpdateGroupAccessDto } from './dto/update-group-access.dto';

/** Exposes the fixed deployment group and editable membership settings. */
@ApiTags('settings')
@Controller('settings/access')
@UseGuards(RolesGuard)
@Roles('canManageSettings')
export class GroupAccessController {
  constructor(private readonly access: GroupAccessService) {}

  @Get()
  @ApiOperation({ summary: 'Read group access policy' })
  @ApiResponse({ status: 200, description: 'Current group access policy' })
  @ApiResponse({ status: 403, description: 'Requires settings management permission' })
  getPolicy() {
    return this.access.getPolicy();
  }

  @Put()
  @ApiOperation({ summary: 'Update group display name and alumni access (group ID is fixed)' })
  @ApiResponse({ status: 200, description: 'Policy saved; membership changes require a new login' })
  @ApiResponse({ status: 400, description: 'Invalid fields or attempted group ID change' })
  @ApiResponse({ status: 409, description: 'Policy changed since it was loaded' })
  @ApiResponse({ status: 403, description: 'Requires settings management permission' })
  updatePolicy(@Body() dto: UpdateGroupAccessDto) {
    return this.access.updatePolicy(dto);
  }
}
