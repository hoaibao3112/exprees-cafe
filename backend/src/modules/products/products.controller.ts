import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get('menu')
  @ApiOperation({ summary: 'Get grouped menu categories with products' })
  getMenu() {
    return this.productsService.findMenu();
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get product detail by slug' })
  getProductBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }
}
