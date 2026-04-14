import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { MemoRepository } from '../memo.repository';
import { CreateCardSetDto, UpdateCardSetDto } from '../dto/create-card-set.dto';
import { CreateCardDto, UpdateCardDto } from '../dto/create-card.dto';

@Injectable()
export class CardSetsService {
  constructor(private memoRepository: MemoRepository) {}

  async createCardSet(dto: CreateCardSetDto, userId: string) {
    return this.memoRepository.createCardSet({
      name: dto.name,
      description: dto.description,
      isPublic: dto.isPublic ?? true,
      ownerId: userId,
    });
  }

  async findAll(limit = 20) {
    return this.memoRepository.findPublicCardSets(limit);
  }

  async findOne(id: string, includeCards = false) {
    const cardSet = await this.memoRepository.findCardSetById(id, includeCards);
    if (!cardSet) {
      throw new NotFoundException('Card set not found');
    }
    return cardSet;
  }

  async findUserSets(userId: string) {
    return this.memoRepository.findUserCardSets(userId);
  }

  async update(id: string, dto: UpdateCardSetDto, userId: string) {
    const cardSet = await this.memoRepository.findCardSetById(id);
    if (!cardSet) {
      throw new NotFoundException('Card set not found');
    }

    if (cardSet.ownerId !== userId) {
      throw new ForbiddenException('You can only update your own card sets');
    }

    return this.memoRepository.updateCardSet(id, dto);
  }

  async delete(id: string, userId: string, userRole?: string) {
    const cardSet = await this.memoRepository.findCardSetById(id);
    if (!cardSet) {
      throw new NotFoundException('Card set not found');
    }

    // Admin can delete any card set
    if (userRole !== 'admin' && cardSet.ownerId !== userId) {
      throw new ForbiddenException('You can only delete your own card sets');
    }

    await this.memoRepository.deleteCardSet(id);
  }

  // Card methods
  async createCard(cardSetId: string, dto: CreateCardDto, userId: string) {
    const cardSet = await this.memoRepository.findCardSetById(cardSetId);
    if (!cardSet) {
      throw new NotFoundException('Card set not found');
    }

    if (cardSet.ownerId !== userId) {
      throw new ForbiddenException('You can only add cards to your own sets');
    }

    // Get max sort order
    const cards = await this.memoRepository.findCardsBySetId(cardSetId);
    const maxSortOrder = cards.reduce(
      (max, card) => Math.max(max, card.sortOrder),
      -1,
    );

    return this.memoRepository.createCard({
      cardSetId,
      imageUrl: dto.imageUrl,
      sortOrder: dto.sortOrder ?? maxSortOrder + 1,
    });
  }

  async updateCard(cardId: string, dto: UpdateCardDto, userId: string) {
    const cards = await this.memoRepository.findCardsBySetId('');
    // Need to find card first to get cardSetId
    const card = await this.memoRepository['cardRepository'].findOne({
      where: { id: cardId },
    });
    if (!card) {
      throw new NotFoundException('Card not found');
    }

    const cardSet = await this.memoRepository.findCardSetById(card.cardSetId);
    if (!cardSet || cardSet.ownerId !== userId) {
      throw new ForbiddenException(
        'You can only update cards in your own sets',
      );
    }

    return this.memoRepository.updateCard(cardId, dto);
  }

  async deleteCard(cardId: string, userId: string) {
    const card = await this.memoRepository['cardRepository'].findOne({
      where: { id: cardId },
    });
    if (!card) {
      throw new NotFoundException('Card not found');
    }

    const cardSet = await this.memoRepository.findCardSetById(card.cardSetId);
    if (!cardSet || cardSet.ownerId !== userId) {
      throw new ForbiddenException(
        'You can only delete cards from your own sets',
      );
    }

    await this.memoRepository.deleteCard(cardId);
  }
}
