'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

// Interfaz para nuestros Items
interface Item {
    id: number;
    title: string;
    description: string | null;
    completed: boolean;
    created_at: string;
}

export default function Home() {
  // Estado para la API health
    const [health, setHealth] = useState({ status: '', message: '' });
    const [loading, setLoading] = useState(true);

  // Estados para los items
    const [items, setItems] = useState<Item[]>([]);
    const [newItem, setNewItem] = useState({ title: '', description: '', completed: false });
    const [activeItem, setActiveItem] = useState<Item | null>(null);

  // Comprobar estado de salud de la API al cargar
    useEffect(() => {
    const checkApiHealth = async () => {
        try {
        const response = await axios.get('/api/health');
        setHealth(response.data);
        
        // Si la API está funcionando, cargar los items
        if (response.data.status === 'ok') {
            loadItems();
        }
        } catch (error) {
        console.error('Error al verificar la salud de la API:', error);
        setHealth({ status: 'error', message: 'No se pudo conectar con la API' });
        } finally {
        setLoading(false);
        }
    };

    checkApiHealth();
    }, []);

  // Cargar items desde el backend
    const loadItems = async () => {
    try {
        const response = await axios.get('/api/items');
        setItems(response.data);
    } catch (error) {
        console.error('Error al cargar items:', error);
    }
    };

  // Crear un nuevo item
    const createItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await axios.post('/api/items', newItem);
        setNewItem({ title: '', description: '', completed: false });
        loadItems();
    } catch (error) {
        console.error('Error al crear el item:', error);
    }
    };

  // Actualizar un item existente
    const updateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;
    
    try {
        await axios.put(`/api/items/${activeItem.id}`, {
        title: activeItem.title,
        description: activeItem.description,
        completed: activeItem.completed
        });
        setActiveItem(null);
        loadItems();
    } catch (error) {
        console.error('Error al actualizar el item:', error);
    }
    };

  // Eliminar un item
    const deleteItem = async (id: number) => {
    try {
        await axios.delete(`/api/items/${id}`);
        loadItems();
    } catch (error) {
        console.error('Error al eliminar el item:', error);
    }
    };

  // Togglear el estado completado de un item
    const toggleComplete = async (item: Item) => {
    try {
        await axios.put(`/api/items/${item.id}`, {
        ...item,
        completed: !item.completed
        });
        loadItems();
    } catch (error) {
        console.error('Error al actualizar el item:', error);
    }
    };

    return (
    <main className="min-h-screen p-8 bg-gray-100">
        <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-blue-600">Mi Aplicación Web</h1>
        
        {/* Estado de la API */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
            <h2 className="text-2xl font-semibold mb-4">Estado de la API:</h2>
        
            {loading ? (
            <p>Cargando el estado de la API...</p>
            ) : (
            <div className="p-4 border rounded">
                <p className="mb-2">
                <span className="font-bold">Estado:</span>{' '}
                <span className={health.status === 'ok' ? 'text-green-600' : 'text-red-600'}>
                {health.status}
                </span>
                </p>
                <p>
                <span className="font-bold">Mensaje:</span> {health.message}
                </p>
            </div>
            )}
        </div>
        
        {/* Formulario para crear items */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
            <h2 className="text-2xl font-semibold mb-4">Crear Nuevo Item</h2>

            <form onSubmit={createItem} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Título</label>
                <input
                type="text"
                value={newItem.title}
                onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                value={newItem.description}
                onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
            </div>
            
            <div>
                <label className="flex items-center">
                <input
                    type="checkbox"
                    checked={newItem.completed}
                    onChange={(e) => setNewItem({...newItem, completed: e.target.checked})}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Completado</span>
                </label>
            </div>
            
            <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                Crear Item
            </button>
            </form>
        </div>
        
        {/* Lista de items */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Lista de Items</h2>
                
            {items.length === 0 ? (
            <p className="text-gray-500">No hay items disponibles.</p>
            ) : (
            <ul className="divide-y divide-gray-200">
                {items.map((item) => (
                <li key={item.id} className="py-4">
                    <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleComplete(item)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="ml-3">
                        <p className={`text-sm font-medium ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {item.title}
                        </p>
                        {item.description && (
                            <p className="text-sm text-gray-500">{item.description}</p>
                        )}
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <button
                        onClick={() => setActiveItem(item)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                        Editar
                        </button>
                        <button
                        onClick={() => deleteItem(item.id)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                        Eliminar
                        </button>
                    </div>
                    </div>
                </li>
                ))}
            </ul>
            )}
        </div>
        
        {/* Modal para editar item */}
        {activeItem && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Editar Item</h3>

                <form onSubmit={updateItem} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Título</label>
                    <input
                    type="text"
                    value={activeItem.title}
                    onChange={(e) => setActiveItem({...activeItem, title: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                    <textarea
                    value={activeItem.description || ''}
                    onChange={(e) => setActiveItem({...activeItem, description: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
                
                <div>
                    <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={activeItem.completed}
                        onChange={(e) => setActiveItem({...activeItem, completed: e.target.checked})}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Completado</span>
                    </label>
                </div>
                
                <div className="flex justify-end space-x-3">
                    <button
                    type="button"
                    onClick={() => setActiveItem(null)}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                    Cancelar
                    </button>
                    <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                    Guardar
                    </button>
                </div>
                </form>
            </div>
            </div>
        )}
        </div>
    </main>
    );
}