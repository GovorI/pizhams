import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductsFilterDto } from './dto/get-products-filter.dto';
import { NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: Repository<Product>;

  const mockProduct: Product = {
    id: 'test-uuid-123',
    name: 'Test Pizhama',
    description: 'Test description',
    price: 2999.99,
    category: 'classic',
    sizes: ['S', 'M', 'L'],
    colors: ['blue', 'red'],
    images: ['image1.jpg'],
    stock: 10,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const createMockQueryBuilder = () => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  });

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(createMockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createDto: CreateProductDto = {
        name: 'New Pizhama',
        description: 'Description',
        price: 1999.99,
        category: 'classic',
        sizes: ['M', 'L'],
        colors: ['green'],
        images: ['new.jpg'],
        stock: 5,
      };

      mockRepository.create.mockReturnValue(createDto);
      mockRepository.save.mockResolvedValue({ ...mockProduct, ...createDto });

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(createDto);
      expect(result.name).toBe(createDto.name);
      expect(result.price).toBe(createDto.price);
    });
  });

  describe('findAll', () => {
    it('should return paginated products without filters', async () => {
      const filterDto: GetProductsFilterDto = { page: 1, limit: 10 };
      const products = [mockProduct];

      const mockQB = createMockQueryBuilder();
      mockQB.getManyAndCount.mockResolvedValue([products, 1] as [
        Product[],
        number,
      ]);
      mockRepository.createQueryBuilder.mockReturnValue(mockQB);

      const result = await service.findAll(filterDto);

      expect(result.data).toEqual(products);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should filter by category', async () => {
      const filterDto: GetProductsFilterDto = {
        category: 'classic',
        page: 1,
        limit: 10,
      };

      const mockQB = createMockQueryBuilder();
      mockQB.getManyAndCount.mockResolvedValue([[mockProduct], 1] as [
        Product[],
        number,
      ]);
      mockRepository.createQueryBuilder.mockReturnValue(mockQB);

      await service.findAll(filterDto);

      expect(mockQB.where).toHaveBeenCalledWith(
        'product.category = :category',
        {
          category: 'classic',
        },
      );
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findOne('test-uuid-123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-uuid-123' },
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException when product not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateDto = { name: 'Updated Name', price: 3999.99 };

      mockRepository.findOne.mockResolvedValue(mockProduct);
      mockRepository.save.mockResolvedValue({ ...mockProduct, ...updateDto });

      const result = await service.update('test-uuid-123', updateDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-uuid-123' },
      });
      expect(repository.save).toHaveBeenCalledWith({
        ...mockProduct,
        ...updateDto,
      });
      expect(result.name).toBe('Updated Name');
    });

    it('should throw NotFoundException when updating non-existent product', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a product', async () => {
      mockRepository.findOne.mockResolvedValue(mockProduct);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove('test-uuid-123');

      expect(repository.delete).toHaveBeenCalledWith('test-uuid-123');
    });

    it('should throw NotFoundException when removing non-existent product', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
