import {useEffect, useState} from 'react'
import {Feed} from 'hyperspace'
import {ITreeRepresentation, Registry} from '../domain/registry'
import {useConstant, useError} from './utility'

// Hook to register a local registry to listen to local file changes and push to remote
const useLocalRegistry = (dir: string, eventLog: Feed | undefined) => {
  const {errors, addError} = useError()
  const [loading, setLoading] = useState(true)

  // Array representation of registry internal trie
  const [registryRenderableArray, setRegistryRenderableArray] = useState<ITreeRepresentation[]>([])

  // Create registry and add handlers
  const localRegistry: Registry = useConstant<Registry>(() => new Registry()
    .onError(addError)
    .onRerender(() => {
      setRegistryRenderableArray(localRegistry.getTree())
    })
  )

  // Subscribe to local to publish to eventLog if present
  useEffect(() => {
    if (eventLog) {
      localRegistry
        .addSubscriber(data => {
          eventLog
            .append(JSON.stringify(data))
            .catch(addError)
        })
        .watch(dir, () => {
          setLoading(false)
        })
    }
  }, [eventLog])

  return {
    errors,
    loading,
    localRegistry,
    registryRenderableArray
  }
}

export default useLocalRegistry
