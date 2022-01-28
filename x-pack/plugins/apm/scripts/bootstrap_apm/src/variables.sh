#!/usr/bin/env bash

# cluster configuration
export VERSION='7.17.0'
export DEPLOYMENT_NAME='performance-apm-cluster'
export HOST='https://staging.found.no'
export REGION='gcp-us-central1'
export HARDWARE_PROFILE='gcp-cpu-optimized'

export KB_ROOT='../../../../../../'
export ES_TARGET=${ES_TARGET-}

export ECCTL_CONFIG=$HOME/.ecctl/config.json

# synthtrace 
export SCENARIO_FILE='01_simple_trace.ts'
export SYNTHTRACE_OPTIONS=''
