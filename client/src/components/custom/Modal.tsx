interface Props {
  title: string,
  onClose: () => void,
  onConfirm: () => void,
  children: React.ReactNode,
  confirmText?: string,
  danger?: boolean
}

export const Modal = ({ title, onClose, onConfirm, children, confirmText = 'Crear', danger = false }: Props) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>{title}</h3>
        {children}
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
