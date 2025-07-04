(async function () {
    const baseURL = window.location.origin + window.location.pathname.split('/').slice(0, 3).join('/')

    const variableGroupFilter = document.getElementsByClassName("bolt-text-filterbaritem-input")[0].value

    const variableGroups = await (await fetch(`${baseURL}/_apis/distributedtask/variablegroups?groupName=*${variableGroupFilter}*&continuationToken=0&queryOrder=0`, {
    "headers": {
      "accept": "application/json;api-version=7.2-preview.2;excludeUrls=true"
    }
  })).json()

    const usedVariables = variableGroups.value
        .map(i => {
            return {
                id: i.id,
                name: i.name,
                variables: Object.keys(i.variables).reduce((prev, j) => {
                    const val = (i.variables[j].isSecret) ? '*****' : i.variables[j].value
                    prev[j] = val
                    return prev
                }, {})
            }
        })

    var table = []

    usedVariables.forEach(i => {
        Object.keys(i.variables).forEach((j) => {
            table.push({
                //definitionName: '"' + definitionName + '"',
                //definitionId: definitionId * 1,
                libName: '"' + i.name + '"',
                //libId: i.id,
                key: j,
                val: '"' + i.variables[j].replace(/"/g, '""') + '"'
            })
        })
    })

    const exportData = (data) => {
        const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' })
        saveFile(blob)
    }

    const saveFile = (blob) => {
        const filename = variableGroupFilter + '_' + new Date().toISOString() + '.csv'
        const link = document.createElement("a")
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob)
            link.href = url
            link.download = filename
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }

    var header = Object.keys(table[0]).join(',')
    var body = table.map(i => Object.values(i).join(',')).join('\n')
    var csv = header + '\n' + body

    exportData(csv)
}())
