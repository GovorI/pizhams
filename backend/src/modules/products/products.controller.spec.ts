import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductsFilterDto } from './dto/get-products-filter.dto';
import { Product, ProductSize } from './entities/product.entity';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProduct: Product = {
    id: 'test-uuid',
    name: 'Test Pizhama',
    description: 'Test description',
    price: 2999.99,
    category: 'classic',
    sizes: ['S', 'M', 'L'],
    colors: ['blue'],
    images: ['image1.jpg'],
    stock: 10,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createDto: CreateProductDto = {
        name: 'New Pizhama',
        description: 'Description',
        price: 1999.99,
        category: 'classic',
        sizes: ['M'],
        colors: ['red'],
        images: ['new.jpg'],
      };

      mockProductsService.create.mockResolvedValue({
        ...mockProduct,
        ...createDto,
      });

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result.name).toBe(createDto.name);
    });
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const filterDto: GetProductsFilterDto = { page: 1, limit: 10 };
      const paginatedResult = {
        data: [mockProduct],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockProductsService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(filterDto);

      expect(service.findAll).toHaveBeenCalledWith(filterDto);
      expect(result).toEqual(paginatedResult);
    });

    it('should accept filter parameters', async () => {
      const filterDto: GetProductsFilterDto = {
        category: 'classic',
        size: ProductSize.M,
        page: 1,
        limit: 10,
      };
      const paginatedResult = {
        data: [mockProduct],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockProductsService.findAll.mockResolvedValue(paginatedResult);

      await controller.findAll(filterDto);

      expect(service.findAll).toHaveBeenCalledWith(filterDto);
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      mockProductsService.findOne.mockResolvedValue(mockProduct);

      const result = await controller.findOne('test-uuid');

      expect(service.findOne).toHaveBeenCalledWith('test-uuid');
      expect(result).toEqual(mockProduct);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateDto = { name: 'Updated Name' };
      const updatedProduct = { ...mockProduct, ...updateDto };

      mockProductsService.update.mockResolvedValue(updatedProduct);

      const result = await controller.update('test-uuid', updateDto);

      expect(service.update).toHaveBeenCalledWith('test-uuid', updateDto);
      expect(result.name).toBe('Updated Name');
    });
  });

  describe('remove', () => {
    it('should remove a product', async () => {
      mockProductsService.remove.mockResolvedValue(undefined);

      await controller.remove('test-uuid');

      expect(service.remove).toHaveBeenCalledWith('test-uuid');
    });
  });
});
