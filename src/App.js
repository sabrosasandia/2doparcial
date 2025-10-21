import React, { useState, useEffect } from 'react';
import './TablaDatosDB.css'; // Opcional: Para estilos CSS

function TablaDatosDB() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: '',
    apellidos: '',
    fecha_nacimiento: '',
    ci: '',
    nit: '',
    direccion: '',
    telefono: '',
    email: '',
    estado: 1 // Por defecto en 1 (activo)
  });

  // URL de tu API PHP en Laragon
  const API_URL = 'http://api-react-db.test/get_data.php';
  const API_URL_ADD = 'http://api-react-db.test/add_data.php';

  // Función asíncrona para obtener los datos
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);

      // Si la respuesta no es OK (ej. error 404, 500), lanzar un error
      if (!response.ok) {
        throw new Error(`Error en la red: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Asumiendo que result es un array de objetos con los datos de tu BD
      setData(result); 

    } catch (e) {
      console.error("Error al obtener datos:", e);
      setError("No se pudieron cargar los datos. Verifica la conexión del servidor Laragon y la API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // Se ejecuta solo al montar el componente

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoCliente(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validación simple
    if (!nuevoCliente.nombre || !nuevoCliente.apellidos || !nuevoCliente.ci) {
      alert('Nombre, Apellidos y CI son campos obligatorios.');
      return;
    }

    try {
      const response = await fetch(API_URL_ADD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoCliente),
      });

      const result = await response.json();

      if (response.ok && result.mensaje) {
        alert(result.mensaje);
        setIsModalOpen(false); // Cierra el modal
        fetchData(); // Recarga los datos de la tabla
        // Limpia el formulario para el próximo uso
        setNuevoCliente({
          nombre: '', apellidos: '', fecha_nacimiento: '', ci: '', nit: '',
          direccion: '', telefono: '', email: '', estado: 1
        });
      } else {
        // Tu API devuelve la clave "error" en caso de fallo
        throw new Error(result.error || 'Error desconocido al añadir el cliente.');
      }
    } catch (error) {
      console.error('Error al enviar datos:', error);
      setError(`Error al enviar datos: ${error.message}`);
    }
  };

  // 1. Estados de la Interfaz

  if (loading) {
    return <p>Cargando datos de la base de datos... ⏳</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Error: {error}</p>;
  }

  if (data.length === 0) {
    return <p>No se encontraron registros en la tabla.</p>;
  }

  // 2. Renderizado de la Tabla

  // Obtenemos los nombres de las columnas (keys) del primer objeto para las cabeceras
  const columns = Object.keys(data[0]);

  // Filtramos las columnas que no queremos mostrar
  const filteredColumns = columns.filter(col => col !== 'cod_cliente' && col !== 'estado');

  return (
    <div className="tabla-datos-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Listado de Clientes</h1>
        <button onClick={() => setIsModalOpen(true)} style={{ padding: '10px 15px', fontSize: '16px', cursor: 'pointer' }}>
          Añadir Cliente
        </button>
      </div>

      {isModalOpen && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <div style={modalStyles.header}>
              <h2>Añadir Nuevo Cliente</h2>
              <button onClick={() => setIsModalOpen(false)} style={modalStyles.closeButton}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} style={modalStyles.form}>
              <input name="nombre" value={nuevoCliente.nombre} onChange={handleInputChange} placeholder="Nombre" required />
              <input name="apellidos" value={nuevoCliente.apellidos} onChange={handleInputChange} placeholder="Apellidos" required />
              <input name="fecha_nacimiento" value={nuevoCliente.fecha_nacimiento} onChange={handleInputChange} placeholder="Fecha de Nacimiento" type="date" />
              <input name="ci" value={nuevoCliente.ci} onChange={handleInputChange} placeholder="CI" type="number" required />
              <input name="nit" value={nuevoCliente.nit} onChange={handleInputChange} placeholder="NIT" type="number" />
              <input name="direccion" value={nuevoCliente.direccion} onChange={handleInputChange} placeholder="Dirección" />
              <input name="telefono" value={nuevoCliente.telefono} onChange={handleInputChange} placeholder="Teléfono" type="number" />
              <input name="email" value={nuevoCliente.email} onChange={handleInputChange} placeholder="Email" type="email" />
              {/* El campo estado no se muestra porque ya tiene un valor por defecto */}
              <div style={modalStyles.footer}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={modalStyles.cancelButton}>Cancelar</button>
                <button type="submit" style={modalStyles.submitButton}>Guardar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <table className="datos-table">
        <thead>
          <tr>
            {filteredColumns.map((columnName) => (
              <th key={columnName}>{columnName.toUpperCase()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {filteredColumns.map((columnName) => (
                <td key={columnName}>{row[columnName]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Estilos para el modal (puedes moverlos a tu CSS)
const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    width: '500px',
    maxWidth: '90%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #ccc',
    paddingBottom: '10px',
    marginBottom: '20px',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px',
  },
  cancelButton: {
    padding: '10px 15px',
    cursor: 'pointer',
  },
  submitButton: {
    padding: '10px 15px',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
  }
};

export default TablaDatosDB;
