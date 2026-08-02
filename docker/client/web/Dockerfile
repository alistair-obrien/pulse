    # Build inside a docker container to ensure a consistent build environment
    InvokeDockerBuilder `
        -Source $SrcRoot `
        -Publish $BuildPath `
        -Image pulse-client-builder `
        -Command @(
            "npm"
            "ci"
            "npx"
            "vite"
            "build" 
            "--mode" 
            $Environment
        )