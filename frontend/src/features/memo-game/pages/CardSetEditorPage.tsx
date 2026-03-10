import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  useGetCardSetQuery,
  useUpdateCardSetMutation,
  useCreateCardMutation,
  useDeleteCardMutation,
  useUploadCardImageMutation,
} from '../api/memo.api';
import type { Card } from '../api/memo.types';
import './CardSetEditorPage.css';

export const CardSetEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: cardSet, isLoading, refetch } = useGetCardSetQuery({ id: id!, includeCards: true });
  const [updateCardSet] = useUpdateCardSetMutation();
  const [createCard] = useCreateCardMutation();
  const [deleteCard] = useDeleteCardMutation();
  const [uploadImage] = useUploadCardImageMutation();

  // Mock game object for grid size calculation (default 4x3)
  const game = { gridRows: 4, gridCols: 3 };

  const [isUploading, setIsUploading] = useState(false);
  const [editingName, setEditingName] = useState(cardSet?.name || '');

  // Calculate required photos based on grid size
  // Each photo creates 2 cards (a pair), so we need half the number of cards
  const totalCards = game?.gridRows && game?.gridCols ? game.gridRows * game.gridCols : 12;
  const requiredPhotos = totalCards / 2; // Each photo = 2 cards (pair)
  const currentCards = cardSet?.cards?.length || 0;
  const currentPhotos = Math.ceil(currentCards / 2); // Count unique photos (each photo = 2 cards)
  const remainingPhotos = Math.max(0, requiredPhotos - currentPhotos);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Limit files to remaining slots
    const filesToUpload = files.length > remainingPhotos ? files.slice(0, remainingPhotos) : files;
    
    if (currentPhotos >= requiredPhotos) {
      toast.error(`Достаточно фото! Нужно ${requiredPhotos} фото для поля ${game?.gridRows}x${game?.gridCols}`);
      return;
    }

    setIsUploading(true);

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error('Только изображения');
          continue;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error('Файл больше 5МБ');
          continue;
        }

        // Upload image and get URL
        const uploadResult = await uploadImage({ file }).unwrap();
        
        // Create TWO cards with the same image (a pair)
        await createCard({
          setId: id!,
          body: {
            imageUrl: uploadResult.url,
            sortOrder: currentCards + i * 2,
          },
        }).unwrap();
        
        // Create second card of the pair
        await createCard({
          setId: id!,
          body: {
            imageUrl: uploadResult.url,
            sortOrder: currentCards + i * 2 + 1,
          },
        }).unwrap();

        toast.success(`Загружено: ${file.name}`);
      }

      await refetch();
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err?.data?.message || err?.message || 'Ошибка загрузки');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Удалить эту карточку?')) return;

    try {
      await deleteCard({ id: cardId }).unwrap();
      toast.success('Карточка удалена');
      await refetch();
    } catch (err) {
      toast.error('Ошибка удаления');
    }
  };

  const handleUpdateName = async () => {
    try {
      await updateCardSet({
        id: id!,
        body: { name: editingName },
      }).unwrap();
      toast.success('Название обновлено');
    } catch (err) {
      toast.error('Ошибка обновления');
    }
  };

  const handleStartGame = async () => {
    const currentCards = cardSet?.cards?.length || 0;
    const minCards = 6; // Minimum 3 pairs for 3x2 grid
    
    if (currentCards < minCards) {
      toast.error(`Нужно минимум ${minCards / 2} фото (${minCards} карточек)`);
      return;
    }

    // Check if we have even number of cards
    if (currentCards % 2 !== 0) {
      toast.error('Добавьте ещё одну карточку для пары (нужно чётное количество)');
    }

    navigate(`/memo/${id}`);
  };

  if (isLoading) {
    return <div className="editor-loading">Загрузка...</div>;
  }

  if (!cardSet) {
    return (
      <div className="editor-error">
        <h2>Набор не найден</h2>
        <button onClick={() => navigate('/memo')}>Назад</button>
      </div>
    );
  }

  const progressPercent = (currentPhotos / requiredPhotos) * 100;

  return (
    <div className="card-set-editor">
      <div className="editor-header">
        <button className="back-btn" onClick={() => navigate('/memo')}>
          ← Назад
        </button>
        <div className="editor-title">
          <input
            type="text"
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            onBlur={handleUpdateName}
            placeholder="Название набора"
          />
        </div>
        <button className="play-btn" onClick={handleStartGame}>
          🎮 Играть
        </button>
      </div>

      <div className="editor-info">
        <div className="info-card">
          <h3>📊 Прогресс</h3>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <p>
            {currentPhotos} / {requiredPhotos} фото ({currentCards} карточек)
          </p>
          <p className="info-hint">
            Поле: {game?.gridRows}x{game?.gridCols} = {totalCards} карточек ({requiredPhotos} пар)
          </p>
          {remainingPhotos > 0 && (
            <p className="info-hint">
              Нужно ещё: {remainingPhotos} фото
            </p>
          )}
        </div>

        <div className="info-card">
          <h3>📏 Размеры поля</h3>
          <ul className="grid-sizes">
            <li>3×2 = 6 карточек (3 фото)</li>
            <li>4×3 = 12 карточек (6 фото)</li>
            <li>4×4 = 16 карточек (8 фото)</li>
            <li>6×4 = 24 карточки (12 фото)</li>
            <li>8×4 = 32 карточки (16 фото)</li>
          </ul>
        </div>
      </div>

      <div className="upload-section">
        <h3>📸 Загрузить фото</h3>
        <p className="upload-hint">
          Выберите изображения (PNG, JPG, WEBP, до 5MB каждое)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={isUploading || currentPhotos >= requiredPhotos}
          id="file-upload"
        />
        <label htmlFor="file-upload" className="upload-btn">
          {isUploading ? 'Загрузка...' : `+ Добавить ещё ${remainingPhotos} фото`}
        </label>
        {currentPhotos >= requiredPhotos && (
          <p className="max-reached">Достаточно фото для этого размера поля ({requiredPhotos} фото = {totalCards} карточек)</p>
        )}
      </div>

      <div className="cards-grid">
        <h3>🃏 Карточки ({currentCards})</h3>
        {cardSet.cards && cardSet.cards.length > 0 ? (
          <div className="cards-list">
            {cardSet.cards.map((card: Card, index: number) => (
              <div key={card.id} className="card-item">
                <span className="card-number">#{index + 1}</span>
                <img src={card.imageUrl} alt={`Card ${index + 1}`} />
                <button
                  className="delete-card-btn"
                  onClick={() => handleDeleteCard(card.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-cards">
            <p>Нет карточек</p>
            <p>Загрузите {requiredPhotos} фото для поля {game?.gridRows}x{game?.gridCols} (каждое фото = 2 карточки)</p>
          </div>
        )}
      </div>
    </div>
  );
};
