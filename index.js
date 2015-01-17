var fs      = require('fs')
var blessed = require('blessed'),
    screen  = blessed.screen()

if (process.argv[2]) {
  var FILE_NAME = process.argv[2]
} else {
  console.log('no file name supplied')
  process.exit(1)
}

var insertMode = false

var box = blessed.box({
  top: 'center',
  left: 'center',
  width: '95%',
  height: '95%',
  tags: true,
  border: { type: 'line' },
  style: { fg: 'red' }
})
screen.append(box)

box.setLabel('command mode')

screen.key('i', function(ch, key) {
  insertMode = true
  box.setLabel('insert mode')
  screen.render()
})

screen.key('escape', function(ch, key) {
  insertMode = false
  box.setLabel('command mode')
  screen.render()
})

screen.key(['backspace', 'delete'], function(ch, key) {
  box.setContent(box.getContent().slice(0, -1))
  screen.render()
})

screen.key('enter', function(ch, key) {
  if (insertMode) {
    box.deleteBottom()
    screen.render()
  }
})

screen.key('d', function(ch, key) {
  if (!insertMode) {
    box.deleteBottom()
    screen.render()
  }
})

screen.on('keypress', function(data) {
  if (data.length && data.indexOf('\n') < 0 && insertMode) {
    box.setContent(box.getContent() + data)
    screen.render()
  }
})

screen.key(['q', 'C-c'], function(ch, key) {
  if (!insertMode) {
    return process.exit(0)
  }
})

screen.key(['b', 'C-s'], function(ch, key) {
  if (!insertMode) {
    box.setLabel('saving', FILE_NAME, '...')
    fs.writeFile(FILE_NAME, box.content, function(err) {
      if (err) {
        console.log(err)
      }
    })
    box.setLabel('command mode')
  }
})

box.focus()
screen.render()

