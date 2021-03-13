const {Command, flags} = require('@oclif/command')
const oebb = require('oebb')
const moment = require('moment')

class OebbTrainsCli extends Command {
  async run() {
    function capitalize(name: string) {
      return name.charAt(0).toUpperCase() + name.slice(1)
    }

    const {flags} = this.parse(OebbTrainsCli)

    if (flags.origin && flags.destination) {
      this.log(
        `Upcoming connections with origin ${capitalize(
          flags.origin
        )} and destination ${capitalize(flags.destination)}:`
      )

      const originResult = oebb.stations.search(flags.origin, {results: 1})
      const destinationResult = oebb.stations.search(flags.destination, {
        results: 1,
      })

      const results = await Promise.all([originResult, destinationResult])
      if (results.length === 2) {
        const originResults = results[0]
        const destinationResults = results[1]
        if (originResults.length === 1 && destinationResults.length === 1) {
          const oebbresults = await oebb.journeys(
            originResults[0].id,
            destinationResults[0].id
          )

          oebbresults.forEach((oElement: any) => {
            const legs = oElement.legs
            const legsStringArray: Array<any> = []
            legs.forEach((leg: any) => {
              let transportationEmoji
              switch (leg.mode) {
              case 'bus':
                transportationEmoji = '🚌'
                break
              case 'train':
                transportationEmoji = '🚂'
                break
              case 'boat':
                transportationEmoji = '⛴'
                break
              default:
                transportationEmoji = '❔'
                break
              }
              const date = moment(leg.departure)
              legsStringArray.push(
                date.format('H:MM') +
                  ' - ' +
                  transportationEmoji +
                  ' ' +
                  leg.line.product.longName.en +
                  ' ' +
                  leg.line.number
              )
            })
            this.log(legsStringArray.join('  -->  '))
          })
        }
      } else {
        this.log('Trouble finding destinations based on input.')
      }
    }
  }
}

OebbTrainsCli.description = `
A CLI tool to quickly find OEBB journies!
`

OebbTrainsCli.flags = {
  // flag with a value (-n, --name=VALUE)
  origin: flags.string({char: 'o', description: 'origin station'}),

  // flag with a value (-n, --name=VALUE)
  destination: flags.string({char: 'd', description: 'destination station'}),

  // add --version flag to show CLI version
  version: flags.version({char: 'v'}),

  // add --help flag to show CLI version
  help: flags.help({char: 'h'}),
}

module.exports = OebbTrainsCli
