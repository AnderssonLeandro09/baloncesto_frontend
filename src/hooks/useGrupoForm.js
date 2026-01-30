/**
 * Hook personalizado para manejar la lógica del formulario de grupos
 */

import { useEffect, useState } from 'react'
import { InscripcionService } from '../api'

export const useGrupoForm = (grupo, minEdad, maxEdad) => {
  const [atletasDisponibles, setAtletasDisponibles] = useState([])
  const [atletasElegibles, setAtletasElegibles] = useState([])
  const [atletasSeleccionados, setAtletasSeleccionados] = useState(grupo?.atletas?.map(a => a.id) || [])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('info')

  // Cargar todos los atletas disponibles (con inscripción habilitada)
  useEffect(() => {
    const fetchAtletas = async () => {
      try {
        const response = await InscripcionService.getAll()
        // Filtrar solo atletas con inscripción habilitada
        const atletasHabilitados = (response || [])
          .filter(inscripcion => inscripcion?.inscripcion?.habilitada)
          .map(item => ({
            id: item.atleta?.id,
            nombre: `${item.persona?.first_name || item.persona?.firts_name || ''} ${item.persona?.last_name || ''}`.trim(),
            identificacion: item.persona?.identification,
            edad: item.atleta?.edad,
          }))
          .filter(a => a.id && a.nombre)
        
        setAtletasDisponibles(atletasHabilitados)
      } catch (error) {
        console.error('Error al cargar atletas:', error)
      }
    }
    fetchAtletas()
  }, [])

  // Actualizar atletas elegibles cuando cambia el rango de edad
  useEffect(() => {
    if (minEdad && maxEdad && !isNaN(minEdad) && !isNaN(maxEdad)) {
      const min = parseInt(minEdad)
      const max = parseInt(maxEdad)
      
      if (min <= max) {
        const elegibles = atletasDisponibles.filter(
          atleta => atleta.edad >= min && atleta.edad <= max
        )
        setAtletasElegibles(elegibles)
      } else {
        setAtletasElegibles([])
      }
    } else {
      setAtletasElegibles([])
    }
  }, [minEdad, maxEdad, atletasDisponibles])

  const toggleAtleta = (atletaId) => {
    // Validar que el ID sea un número positivo válido
    const id = parseInt(atletaId)
    if (!id || id <= 0 || isNaN(id)) {
      console.error('ID de atleta inválido:', atletaId)
      return
    }
    
    setAtletasSeleccionados(prev => {
      // Limitar a un máximo de 100 atletas para prevenir DoS
      if (!prev.includes(id) && prev.length >= 100) {
        console.warn('Máximo 100 atletas por grupo')
        return prev
      }
      
      if (prev.includes(id)) {
        return prev.filter(prevId => prevId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  // Filtrar atletas elegibles por búsqueda
  const atletasFiltrados = atletasElegibles.filter(atleta => {
    const search = searchTerm.toLowerCase()
    return atleta.nombre.toLowerCase().includes(search) ||
           atleta.identificacion.toLowerCase().includes(search)
  })

  // Obtener atletas seleccionados con información completa
  const atletasSeleccionadosInfo = atletasSeleccionados
    .map(id => atletasDisponibles.find(a => a.id === id))
    .filter(Boolean)

  return {
    atletasDisponibles,
    atletasElegibles,
    atletasSeleccionados,
    atletasFiltrados,
    atletasSeleccionadosInfo,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    toggleAtleta
  }
}
