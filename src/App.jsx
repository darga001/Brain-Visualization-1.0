import BrainViewer from './BrainViewer1'
import BrainHover from './BrainHover'

function App() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      <div style={{ width: '50vw', height: '100vh' }}>
        <BrainViewer1 />
      </div>
      <div style={{ width: '50vw', height: '100vh' }}>
        <BrainHover />
      </div>
    </div>
  )
}

export default App
