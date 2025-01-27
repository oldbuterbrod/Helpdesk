import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIndexedDB } from "../../hooks/useIndexedDB";
import './DetailComponent.css'

function DetailComponent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [comment, setComment] = useState(""); 
  const { getDataById, updateData, dbReady } = useIndexedDB("MyDatabase", "MyStore", 1);

  useEffect(() => {
    const fetchData = async () => {
      if (!dbReady) return;
      try {
        const item = await getDataById(Number(id)); // Получаем данные заявки
        setTicket(item);
      } catch (error) {
        console.error("Ошибка при загрузке заявки:", error);
      }
    };
    fetchData();
  }, [dbReady, id, getDataById]);

  const handleStatusChange = async (newStatus) => {
    if (!ticket) return;

    const updatedTicket = { ...ticket, status: newStatus };
    try {
      await updateData(Number(id), updatedTicket); // Обновляем данные в IndexedDB
      setTicket(updatedTicket); // Обновляем состояние
    } catch (error) {
      console.error("Ошибка при обновлении статуса:", error);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    if (!ticket) return;

    const updatedTicket = { ...ticket, priority: newPriority };
    try {
      await updateData(Number(id), updatedTicket); // Обновляем данные в IndexedDB
      setTicket(updatedTicket); // Обновляем состояние
    } catch (error) {
      console.error("Ошибка при обновлении приоритета:", error);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return; // Не добавляем пустые комментарии
    try {
      const updatedComments = ticket.comments ? [...ticket.comments, comment] : [comment];
      await updateData(Number(id), { comments: updatedComments });
      setTicket((prev) => ({ ...prev, comments: updatedComments }));
      setComment(""); // Очищаем поле ввода
    } catch (error) {
      console.error("Ошибка при добавлении комментария:", error);
    }
  };

  const handleDeleteComment = async (index) => {
    try {
      const updatedComments = ticket.comments.filter((_, i) => i !== index);
      await updateData(Number(id), { comments: updatedComments });
      setTicket((prev) => ({ ...prev, comments: updatedComments }));
    } catch (error) {
      console.error("Ошибка при удалении комментария:", error);
    }
  };

  const handleBack = () => {
    navigate('/HelpsCard'); 
  };

  if (!ticket) {
    return <p>Загрузка данных...</p>;
  }

  return (
    <div className="ticket-details-container">
      <h2>Детали заявки №{ticket.number}</h2>
      <p><strong>Описание:</strong> {ticket.description}</p>
      <p><strong>Дата создания:</strong> {ticket.creationDate}</p>
  
      <div className="status-container">
        <strong>Статус:</strong>
        <select
          value={ticket.status}
          onChange={(e) => handleStatusChange(e.target.value)}
        >
          <option value="Новые">Новые</option>
          <option value="В процессе">В процессе</option>
          <option value="Завершенные">Завершенные</option>
        </select>
      </div>
  
      <div className="priority-container">
        <strong>Приоритет:</strong>
        <select
          value={ticket.priority}
          onChange={(e) => handlePriorityChange(e.target.value)}
        >
          <option value="Высокий">Высокий</option>
          <option value="Средний">Средний</option>
          <option value="Низкий">Низкий</option>
        </select>
      </div>
  
      <p><strong>Ответственный сотрудник:</strong> {ticket.responsibleEmployee}</p>
  
    
      <div>
        <h3>Комментарии:</h3>
        {ticket.comments && ticket.comments.length > 0 ? (
          <ul>
            {ticket.comments.map((c, index) => (
              <li key={index}>
                {c}
                <button
                  onClick={() => handleDeleteComment(index)}
                  className="delete-comment"
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-comments">Комментариев пока нет.</p>
        )}
      </div>
  
    
      <div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Введите комментарий..."
        />
        <button onClick={handleAddComment}>Добавить комментарий</button>
      </div>
  
      <button onClick={handleBack} className="back-button">Назад</button>
    </div>
  );
  
  
}

export default DetailComponent;
