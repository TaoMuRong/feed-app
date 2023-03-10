export function printAsForm<T>(objs: T[], keys: string[]) {
    const fields = keys.map(fieldName => {
        return {
            name: fieldName,
            length: Math.max(fieldName.length, ...objs.map(obj => obj[fieldName].toString().length as number))
        }
    })
    // console.log(fields);

    const title = fields.map(field => field.name.padEnd(field.length)).join(' ')
    const underline = "-".repeat(title.length)
    const content = objs.map(obj => fields.map(field => obj[field.name].toString().padEnd(field.length)).join(' ')).join('\n')
    const newLine = ""
    return [
        newLine,
        title,
        underline,
        content,
        underline,
    ].join('\n')
}


// const objs = [
//     { id: "62fe0318aaff35b5a5de512b", nickname: "一颗车厘子", account: "test" },
//     { id: "62fe0318aaff35b5a5de512b", nickname: "一颗", account: "test" },
// ]


// console.log(printAsForm(objs, ["id", "nickname", "account"]));
