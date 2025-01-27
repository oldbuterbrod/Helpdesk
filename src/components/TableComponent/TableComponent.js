import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIndexedDB } from '../../hooks/useIndexedDB';
import './TableComponent.css';

function TableComponent() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    number: '',
    description: '',
    creationDate: '',
    status: '',
    priority: '',
    responsibleEmployee: ''
  });
  const [sortKey, setSortKey] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  const { addData, getAllData, dbReady } = useIndexedDB('MyDatabase', 'MyStore', 1);

  useEffect(() => {
    const fetchData = async () => {
      if (!dbReady) return;
      try {
        const items = await getAllData();
        setData(items);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      }
    };
    fetchData();
  }, [dbReady, getAllData]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!dbReady) return;

    try {
      const newItem = { ...formData };
      await addData(newItem);
      const items = await getAllData();
      setData(items);
      setFormData({
        number: '',
        description: '',
        creationDate: '',
        status: '',
        priority: '',
        responsibleEmployee: ''
      });
    } catch (error) {
      console.error('Ошибка при добавлении элемента:', error);
    }
  };

  const priorityOrder = { Высокий: 3, Средний: 2, Низкий: 1 };
  const statusOrder = { Новые: 1, 'В процессе': 2, Завершенные: 3 };

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const valA = a[sortKey];
    const valB = b[sortKey];

    if (sortKey === 'priority') {
      return sortOrder === 'asc'
        ? priorityOrder[valA] - priorityOrder[valB]
        : priorityOrder[valB] - priorityOrder[valA];
    }

    if (sortKey === 'status') {
      return sortOrder === 'asc'
        ? statusOrder[valA] - statusOrder[valB]
        : statusOrder[valB] - statusOrder[valA];
    }

    if (sortOrder === 'asc') return valA < valB ? -1 : valA > valB ? 1 : 0;
    return valA < valB ? 1 : valA > valB ? -1 : 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  const handleSortChange = (e) => {
    const [key, order] = e.target.value.split('-');
    setSortKey(key);
    setSortOrder(order);
  };

  const resetSorting = () => {
    setSortKey('');
    setSortOrder('asc');
  };

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  return (
    <div className="table-component">
      <div className="form-container">
        <h3>Добавить новую заявку</h3>
        <form onSubmit={handleAddItem} className="form">
          <input type="text" name="number" placeholder="№ Заявки" value={formData.number} onChange={handleFormChange} required />
          <input type="text" name="description" placeholder="Описание" value={formData.description} onChange={handleFormChange} required />
          <input type="text" name="creationDate" placeholder="Дата создания" value={formData.creationDate} onChange={handleFormChange} required />
          <select name="status" value={formData.status} onChange={handleFormChange} required>
            <option value="">Выберите статус</option>
            <option value="Новые">Новые</option>
            <option value="В процессе">В процессе</option>
            <option value="Завершенные">Завершенные</option>
          </select>
          <select name="priority" value={formData.priority} onChange={handleFormChange} required>
            <option value="">Выберите приоритет</option>
            <option value="Высокий">Высокий</option>
            <option value="Средний">Средний</option>
            <option value="Низкий">Низкий</option>
          </select>
          <input type="text" name="responsibleEmployee" placeholder="Ответственный сотрудник" value={formData.responsibleEmployee} onChange={handleFormChange} required />
          <button type="submit">Добавить</button>
        </form>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>№ Заявки</th>
            <th>Описание</th>
            <th>Дата создания</th>
            <th>Статус</th>
            <th>Приоритет</th>
            <th>Ответственный сотрудник</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((row, index) => (
            <tr key={index} onClick={() => navigate(`/Detail/${row.id}`)}>
              <td>{row.number}</td>
              <td>{row.description}</td>
              <td>{row.creationDate}</td>
              <td>{row.status}</td>
              <td>{row.priority}</td>
              <td>{row.responsibleEmployee}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination-container">
        <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>Назад</button>
        <span>Страница {currentPage} из {totalPages}</span>
        <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>Вперед</button>
      </div>

      <div className="sort-container">
        <select onChange={handleSortChange}>
          <option value="" disabled hidden>Выберите сортировку</option>
          <option value="creationDate-asc">По дате создания ▲</option>
          <option value="creationDate-desc">По дате создания ▼</option>
          <option value="priority-asc">По приоритету ▲</option>
          <option value="priority-desc">По приоритету ▼</option>
          <option value="status-asc">По статусу ▲</option>
          <option value="status-desc">По статусу ▼</option>
        </select>
        <button className="reset-sort-button" onClick={resetSorting}>Отменить сортировку</button>
      </div>
    </div>
  );
}

export default TableComponent;
