import React from 'react'
import {Box} from 'ink'
import PropTypes from 'prop-types'
import {SessionInfo} from '../components/SessionInfo'
import FileTree from '../components/FileTree'
import Errors from '../components/Errors'
import useLocalRegistry from '../hooks/useLocalRegistry'
import useDriveSync from '../hooks/useDriveSync'
import Hotkeys from '../components/Hotkeys'
import Stats from '../components/Stats'
import LoadingWrapper from '../components/LoadingWrapper'
import {AppContextProvider} from '../contexts/App'
import useHyper from '../hooks/useHyper'

interface IHostProps {
  dir: string;
  includeGitFiles: boolean;
  verbose: boolean;
  tree: boolean;
}

/// Creates a new portal from the given directory
const Host = ({dir, includeGitFiles, verbose, tree}: IHostProps) => {
  const hyper = useHyper()
  const {
    errors,
    loading,
    localRegistry,
    registryRenderableArray,
    stats,
  } = useLocalRegistry(dir, hyper.hyperObj?.eventLog, !includeGitFiles, verbose)
  useDriveSync(dir, localRegistry, hyper.hyperObj?.drive)

  return (
    <AppContextProvider hyper={hyper}>
      <Box flexDirection="column">
        <SessionInfo numConnected={hyper.numConnected} sessionId={hyper?.hyperObj?.eventLog?.key?.toString('hex')}/>
        <LoadingWrapper loading={loading} loadingMessage={`Scanning directory... ${registryRenderableArray.length} files found`}>
          <FileTree registry={registryRenderableArray} full={tree}/>
          <Stats registry={registryRenderableArray} totalBytes={stats.totalBytes} bytesPerSecond={stats.bytesPerSecond}/>
        </LoadingWrapper>
        <Hotkeys/>
        <Errors errors={errors}/>
      </Box>
    </AppContextProvider>
  )
}

Host.propTypes = {
  /// Directory to create portal from. Defaults to current working directory
  dir: PropTypes.string,

  /// Include git dotfiles
  includeGitFiles: PropTypes.bool,

  /// Verbose mode
  verbose: PropTypes.bool,

  /// Show full folder file tree
  tree: PropTypes.bool,
}
Host.shortFlags = {
  dir: 'd',
  verbose: 'v',
  tree: 't',
}
Host.defaultProps = {
  dir: '.',
  includeGitFiles: false,
  verbose: false,
  tree: false,
}

export default Host

