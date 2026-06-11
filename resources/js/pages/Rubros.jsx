import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal/Modal';
import ConfirmModal from '../components/ConfirmModal/ConfirmModal';
import styles from './Rubros.module.css';

function Rubros() {
    // rubros: lista completa de rubros obtenida del backend
    const [rubros, setRubros] = useState([]);
    // form: datos del formulario del modal (crear/editar)
    const [form, setForm] = useState({ nombreRubro: '' });
    // editingId: si es null estamos creando, si tiene un valor estamos editando ese rubro
    const [editingId, setEditingId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });

    useEffect(() => { fetchRubros(); }, []);

    const fetchRubros = async () => { setRubros((await api.get('/rubros')).data); };

    // Abre el modal en modo creacion: formulario vacio, editingId en null
    const openCreateModal = () => {
        setForm({ nombreRubro: '' });
        setEditingId(null);
        setShowModal(true);
    };

    // Abre el modal en modo edicion: precarga los datos del rubro seleccionado
    const handleEdit = (r) => {
        setForm({ nombreRubro: r.nombreRubro });
        setEditingId(r.id);
        setShowModal(true);
    };

    // Guarda (crea o actualiza) dependiendo de si editingId tiene valor
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingId) await api.put(`/rubros/${editingId}`, form);
        else await api.post('/rubros', form);
        setForm({ nombreRubro: '' });
        setEditingId(null);
        setShowModal(false);
        fetchRubros();
    };

    const handleCancel = () => {
        setForm({ nombreRubro: '' });
        setEditingId(null);
        setShowModal(false);
    };

    const handleDelete = (id) => setConfirmDelete({ isOpen: true, id });

    const handleConfirmDelete = async () => {
        await api.delete(`/rubros/${confirmDelete.id}`);
        setConfirmDelete({ isOpen: false, id: null });
        fetchRubros();
    };

    const handleCancelDelete = () => setConfirmDelete({ isOpen: false, id: null });

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Rubros</h1>
                <button className={styles.fab} onClick={openCreateModal} title="Nuevo rubro">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="22" height="22"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                    <span className={styles.fabText}>Crear</span>
                </button>
            </div>

            <Modal isOpen={showModal} onClose={handleCancel} title={editingId ? 'Editar rubro' : 'Nuevo rubro'}>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <input type="text" name="nombreRubro" value={form.nombreRubro} onChange={e => setForm({ ...form, nombreRubro: e.target.value })} placeholder="Nombre del rubro" className={styles.input} required autoFocus />
                    <div className={styles.formActions}>
                        <button type="submit" className={styles.btn}>{editingId ? 'Actualizar' : 'Crear'}</button>
                        <button type="button" onClick={handleCancel} className={styles.btnCancel}>Cancelar</button>
                    </div>
                </form>
            </Modal>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead><tr><th>ID</th><th>Nombre</th><th>Acciones</th></tr></thead>
                    <tbody>
                        {rubros.map(r => (
                            <tr key={r.id}>
                                <td>{r.id}</td>
                                <td>{r.nombreRubro}</td>
                                <td className={styles.actions}>
                                    <button onClick={() => handleEdit(r)} className={styles.btnEdit}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg></button>
                                    <button onClick={() => handleDelete(r.id)} className={styles.btnDelete}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg></button>
                                </td>
                            </tr>
                        ))}
                        {rubros.length === 0 && <tr><td colSpan={3} className={styles.empty}>No hay rubros</td></tr>}
                    </tbody>
                </table>
            </div>

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                message="¿Eliminar este rubro?"
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </div>
    );
}

export default Rubros;
