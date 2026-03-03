import { ChevronRight, HardDrive } from "lucide-react"

interface Props {
  pathParts: string[],
  navigateTo: (value: string) => void,
}

export const Breadcrum = ({ pathParts, navigateTo }: Props) => {
  return (
    <div className="breadcrumb-bar">
      <button
        className={`breadcrumb-item ${pathParts.length === 0 ? 'active' : ''}`}
        onClick={() => navigateTo('')}
      >
        <HardDrive size={14} /> Mi Nube
      </button>
      {pathParts.map((part, i) => {
        const path = pathParts.slice(0, i + 1).join('/')
        const isLast = i === pathParts.length - 1
        return (
          <span key={path} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <ChevronRight size={12} className="breadcrumb-sep" />
            <button
              className={`breadcrumb-item ${isLast ? 'active' : ''}`}
              onClick={() => !isLast && navigateTo(path)}
            >
              {part}
            </button>
          </span>
        )
      })}
    </div>
  )
}
