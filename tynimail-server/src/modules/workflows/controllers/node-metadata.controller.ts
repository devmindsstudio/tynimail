import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { NodeMetadataService } from '../services/node-metadata.service';

@ApiTags('Workflow Metadata')
@Controller('workflows/metadata')
export class NodeMetadataController {
  constructor(private nodeMetadataService: NodeMetadataService) {}

  /**
   * Get all node types (triggers, actions, rules)
   * Used to populate the node palette in the workflow builder
   */
  @Get('node-types')
  @ApiOperation({
    summary: 'Get all available node types',
    description: 'Returns all triggers, actions, and rules with their configuration schemas',
  })
  getAllNodeTypes() {
    return this.nodeMetadataService.getAllNodeTypes();
  }

  /**
   * Get node types by category
   */
  @Get('node-types/category/:category')
  @ApiOperation({ summary: 'Get node types by category' })
  @ApiParam({
    name: 'category',
    enum: ['triggers', 'actions', 'rules'],
    description: 'Node type category',
  })
  getNodeTypesByCategory(@Param('category') category: 'triggers' | 'actions' | 'rules') {
    return {
      category,
      nodeTypes: this.nodeMetadataService.getNodeTypesByCategory(category),
    };
  }

  /**
   * Get a specific node type by ID
   */
  @Get('node-types/:nodeTypeId')
  @ApiOperation({ summary: 'Get node type details' })
  @ApiParam({
    name: 'nodeTypeId',
    description: 'Node type ID (e.g., send_email, delay, conditional_split)',
    example: 'send_email',
  })
  getNodeTypeById(@Param('nodeTypeId') nodeTypeId: string) {
    const nodeType = this.nodeMetadataService.getNodeTypeById(nodeTypeId);

    if (!nodeType) {
      return {
        success: false,
        error: `Node type not found: ${nodeTypeId}`,
      };
    }

    return {
      success: true,
      nodeType,
    };
  }

  /**
   * Search node types
   */
  @Get('node-types/search')
  @ApiOperation({ summary: 'Search node types' })
  @ApiQuery({
    name: 'q',
    description: 'Search query',
    example: 'email',
  })
  searchNodeTypes(@Query('q') query: string) {
    if (!query) {
      return {
        success: false,
        error: 'Query parameter "q" is required',
      };
    }

    return {
      success: true,
      query,
      results: this.nodeMetadataService.searchNodeTypes(query),
    };
  }

  /**
   * Get all filter operators
   */
  @Get('operators')
  @ApiOperation({
    summary: 'Get all filter operators',
    description: 'Returns all operators for building conditional filters',
  })
  getFilterOperators() {
    return this.nodeMetadataService.getFilterOperators();
  }

  /**
   * Get operators by category
   */
  @Get('operators/category/:category')
  @ApiOperation({ summary: 'Get operators by category' })
  @ApiParam({
    name: 'category',
    description: 'Operator category',
    example: 'comparison',
  })
  getOperatorsByCategory(@Param('category') category: string) {
    return {
      category,
      operators: this.nodeMetadataService.getOperatorsByCategory(category),
    };
  }

  /**
   * Get operators by data type
   */
  @Get('operators/type/:dataType')
  @ApiOperation({ summary: 'Get operators for a data type' })
  @ApiParam({
    name: 'dataType',
    description: 'Data type',
    example: 'string',
    enum: ['string', 'number', 'boolean', 'date', 'array'],
  })
  getOperatorsByType(@Param('dataType') dataType: string) {
    return {
      dataType,
      operators: this.nodeMetadataService.getOperatorsByType(dataType),
    };
  }

  /**
   * Get all available variables for interpolation
   */
  @Get('variables')
  @ApiOperation({
    summary: 'Get all variables',
    description: 'Returns all available variables for use in templates (e.g., {{firstName}})',
  })
  getVariables() {
    return this.nodeMetadataService.getVariables();
  }

  /**
   * Get variables by category
   */
  @Get('variables/category/:category')
  @ApiOperation({ summary: 'Get variables by category' })
  @ApiParam({
    name: 'category',
    description: 'Variable category',
    example: 'contact',
    enum: ['contact', 'custom', 'system', 'trigger'],
  })
  getVariablesByCategory(@Param('category') category: string) {
    return {
      category,
      variables: this.nodeMetadataService.getVariablesByCategory(category),
    };
  }

  /**
   * Validate node configuration
   */
  @Get('validate/:nodeTypeId')
  @ApiOperation({ summary: 'Validate node configuration' })
  @ApiParam({
    name: 'nodeTypeId',
    description: 'Node type ID',
    example: 'send_email',
  })
  @ApiQuery({
    name: 'config',
    description: 'Configuration JSON (URL encoded)',
    required: true,
  })
  validateNodeConfig(
    @Param('nodeTypeId') nodeTypeId: string,
    @Query('config') configJson: string,
  ) {
    try {
      const config = JSON.parse(configJson);
      const validation = this.nodeMetadataService.validateNodeConfig(nodeTypeId, config);

      return {
        success: true,
        nodeTypeId,
        validation,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Invalid JSON in config parameter',
      };
    }
  }
}
