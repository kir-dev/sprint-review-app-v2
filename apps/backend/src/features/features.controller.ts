
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';
import { FeaturesService } from './features.service';

@ApiTags('features')
@Controller('features')
export class FeaturesController {
  constructor(private readonly featuresService: FeaturesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new feature' })
  @ApiBody({ type: CreateFeatureDto })
  @ApiResponse({ status: 201, description: 'Feature created successfully' })
  create(@Body() createFeatureDto: CreateFeatureDto) {
    return this.featuresService.create(createFeatureDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all features' })
  findAll() {
    return this.featuresService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a feature by ID' })
  @ApiParam({ name: 'id', type: 'number' })
  findOne(@Param('id') id: string) {
    return this.featuresService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a feature' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiBody({ type: UpdateFeatureDto })
  update(@Param('id') id: string, @Body() updateFeatureDto: UpdateFeatureDto) {
    return this.featuresService.update(+id, updateFeatureDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a feature' })
  @ApiParam({ name: 'id', type: 'number' })
  remove(@Param('id') id: string) {
    return this.featuresService.remove(+id);
  }
}
