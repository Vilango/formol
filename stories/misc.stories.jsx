/* eslint-disable react/no-multi-comp */

import { withState } from 'storybook4-state'
import { withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react'
import React from 'react'

import Formol, { Field } from '../src'
import { HTMLToEditor, editorToHTML } from '../src/utils/html'
import { colorChoices, countries, persons } from './fields'
import { withStateForm } from './utils'

class FastHTMLFieldFormol extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      item: { bightml: HTMLToEditor(props.html) },
    }
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit(item) {
    const { store } = this.props
    store.set({ submittedHTML: editorToHTML(item.bightml) })
    this.setState({ item })
  }

  render() {
    const { item } = this.state
    return (
      <Formol item={item} onSubmit={this.handleSubmit}>
        <h1>Showcase of the fast HTMLField attribute</h1>
        <Field name="bightml" type="html" fast>
          Big HTML Field
        </Field>
      </Formol>
    )
  }
}

class AsyncChoicesForm extends React.Component {
  state = {
    choices: [],
    objectChoices: [],
  }

  componentDidMount() {
    this.timeout = setTimeout(
      () => this.setState({ choices: countries, objectChoices }),
      1000
    )
  }

  componentWillUnmount() {
    this.timeout && clearTimeout(this.timeout)
    this.timeout = null
  }

  timeout = null

  render() {
    const { choices, objectChoices } = this.state
    return (
      <Formol {...this.props}>
        <h1>Select fields with asynchronously loaded choices</h1>
        <Field>Text</Field>
        <Field name="country" type="select" choices={choices} required>
          Country {choices.length ? null : <small>(Loading)</small>}
        </Field>
        <Field name="country" type="select-menu" choices={choices} required>
          Country {choices.length ? null : <small>(Loading)</small>}
        </Field>
        <Field
          name="complex"
          type="select-menu"
          choices={objectChoices}
          required
        >
          Complex
          {Object.keys(objectChoices).length ? null : <small>(Loading)</small>}
        </Field>
      </Formol>
    )
  }
}

const objectChoices = persons.reduce(
  (choices, person) => ({
    ...choices,
    [`${person.gender === 'woman' ? 'Ms.' : 'M.'} ${person.firstname} ${
      person.name
    }`]: person,
  }),
  { 'M. No Object': 'I am no object' }
)

const stressedChoices = new Array(5000).fill().reduce((choices, _, i) => {
  choices[`Element #${i}`] = `${i}`
  return choices
}, {})

storiesOf('Miscellaneous', module)
  .addDecorator(withKnobs)
  .add(
    'Fast HTML Field',
    withState({})(({ store }) => (
      <FastHTMLFieldFormol
        store={store}
        html={`
      <p>
        <span style="font-size: 96px;">BIG</span>
        <span style="font-size: 48px;">html</span>
      </p>
      `}
      />
    ))
  )
  .add(
    'Adding a nested item',
    withStateForm(props => (
      <Formol {...props}>
        <h1>Edition of nested object properties in an empty object</h1>
        <Field type="number">Identifier</Field>
        <Field name="properties.name">Properties -&gt; Name</Field>
        <Field name="properties.root.realm">
          Properties -&gt; Root -&gt; Realm
        </Field>
        <Field name="properties.extra.0">
          Properties -&gt; Extra -&gt; first array item
        </Field>
        <Field name="properties.extra.1.more.again.0.hereweare" type="number">
          Properties -&gt; Extra -&gt; second array item -&gt; more -&gt; again
          -&gt; first array item -&gt; hereweare
        </Field>
        <Field
          name="properties.extra.2"
          type="checkbox-set"
          choices={['red', 'blue', 'green', 'cyan', 'magenta', 'yellow']}
        >
          Properties -&gt; Extra -&gt; third array array
        </Field>
      </Formol>
    ))
  )
  .add(
    'Editing a nested item',
    withStateForm(
      props => (
        <Formol {...props}>
          <h1>Edition of nested object properties in an existing object</h1>
          <Field type="number">Identifier</Field>
          <Field name="properties.name">Properties -&gt; Name</Field>
          <Field name="properties.root.realm">
            Properties -&gt; Root -&gt; Realm
          </Field>
          <Field name="properties.extra.0">
            Properties -&gt; Extra -&gt; first array item
          </Field>
          <Field name="properties.extra.1.more.again.0.hereweare" type="number">
            Properties -&gt; Extra -&gt; second array item -&gt; more -&gt;
            again -&gt; first array item -&gt; hereweare
          </Field>
          <Field
            name="properties.extra.2"
            type="checkbox-set"
            choices={['red', 'blue', 'green', 'cyan', 'magenta', 'yellow']}
          >
            Properties -&gt; Extra -&gt; third array array
          </Field>
        </Formol>
      ),
      {
        identifier: 4,
        properties: {
          name: 'paul',
          root: {
            realm: '*',
          },
          extra: [
            'extra info',
            {
              more: {
                again: [
                  {
                    hereweare: 42,
                  },
                ],
              },
            },
            ['blue', 'yellow'],
          ],
        },
      }
    )
  )
  .add(
    'Asynchronous choices',
    withStateForm(props => <AsyncChoicesForm {...props} />, {
      country: 'France',
      complex: {
        id: 'dkschrute',
        name: 'K. Schrute',
        firstname: 'Dwight',
        gender: 'man',
      },
    })
  )
  .add(
    'Non string choices values',
    withStateForm(
      props => (
        <Formol {...props}>
          <h1>Select with objects as choices</h1>
          <Field name="simple" type="select" choices={objectChoices}>
            Object select
          </Field>
          <Field multiple name="multiple" type="select" choices={objectChoices}>
            Object select multiple
          </Field>
          <Field name="simple-menu" type="select-menu" choices={objectChoices}>
            Object select menu
          </Field>
          <Field
            multiple
            name="multiple-menu"
            type="select-menu"
            choices={objectChoices}
          >
            Object select multiple menu
          </Field>
          <Field name="radio" type="radio-set" choices={objectChoices}>
            Radio
          </Field>
          <Field name="checkbox" type="checkbox-set" choices={objectChoices}>
            Checkbox
          </Field>
        </Formol>
      ),
      {
        simple: {
          id: 'dkschrute',
          name: 'K. Schrute',
          firstname: 'Dwight',
          gender: 'man',
        },
        multiple: [
          {
            id: 'pbeesly',
            name: 'Beesly',
            firstname: 'Pam',
            gender: 'woman',
          },
          {
            id: 'dkschrute',
            name: 'K. Schrute',
            firstname: 'Dwight',
            gender: 'man',
          },
        ],
        'simple-menu': {
          id: 'dkschrute',
          name: 'K. Schrute',
          firstname: 'Dwight',
          gender: 'man',
        },
        'multiple-menu': [
          {
            id: 'pbeesly',
            name: 'Beesly',
            firstname: 'Pam',
            gender: 'woman',
          },
          {
            id: 'dkschrute',
            name: 'K. Schrute',
            firstname: 'Dwight',
            gender: 'man',
          },
        ],
        radio: {
          id: 'rhoward',
          name: 'Howard',
          firstname: 'Ryan',
          gender: 'man',
        },
        checkbox: [
          {
            id: 'rhoward',
            name: 'Howard',
            firstname: 'Ryan',
            gender: 'man',
          },
          {
            id: 'dkschrute',
            name: 'K. Schrute',
            firstname: 'Dwight',
            gender: 'man',
          },
        ],
      }
    )
  )
  .add(
    'Select menu stress test',
    withStateForm(
      props => (
        <Formol {...props}>
          <h1>Select with a huge number of choice</h1>
          <Field name="stressed" type="select-menu" choices={stressedChoices}>
            Stressed select
          </Field>
          <Field
            name="multiStressed"
            type="select-menu"
            choices={stressedChoices}
            multiple
          >
            Multi Stressed select
          </Field>
        </Formol>
      ),
      {
        stressed: '12',
        multiStressed: [
          '12',
          '123',
          '213',
          '987',
          '2810',
          '3',
          '1938',
          '3432',
          '3923',
          '191',
          '533',
          '2734',
          '2892',
          '9',
          '82',
          '812',
          '871',
          '918',
        ],
      }
    )
  )
  .add(
    'Select menu long options',
    withStateForm(
      props => (
        <Formol {...props}>
          <h1>Select with long options</h1>
          <Field
            name="looong"
            type="select-menu"
            multiple
            choices={new Array(40)
              .fill()
              .map((_, i) => [`A ${'long '.repeat(i)}option`, i])}
          >
            Stressed select
          </Field>
        </Formol>
      ),
      {
        looong: [4, 8, 12, 15],
      }
    )
  )
  .add(
    'Select menu with option style',
    withStateForm(
      props => {
        const colorize = (styles, { data }) => ({
          ...styles,
          color: data.value,
        })

        return (
          <Formol {...props}>
            <h1>Select with colored options</h1>
            <Field
              name="color"
              type="select-menu"
              multiple
              choices={colorChoices}
              styles={{
                option: colorize,
                multiValueLabel: colorize,
                multiValueRemove: colorize,
              }}
            >
              Color
            </Field>
          </Formol>
        )
      },
      {
        color: '808000',
      }
    )
  )
  .add(
    'Dangerous field set raw labels',
    withStateForm(
      props => (
        <Formol {...props}>
          <h1>Field set with raw labels</h1>
          <Field
            name="color"
            type="radio-set"
            choices={Object.entries(colorChoices).map(([k, v]) => [
              `<div style="color: ${v};">${k}</div>`,
              v,
            ])}
            dangerousRawHTMLLabels
          >
            Color
          </Field>
        </Formol>
      ),
      {
        color: '808000',
      }
    )
  )
  .add(
    'Focus/Scroll on error',
    withStateForm(
      props => (
        <Formol {...props}>
          <h1>Focus/Scroll on error</h1>
          {new Array(30).fill().map((_, i) => (
            <Field
              name={`text${i}`}
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              validator={
                i === 2
                  ? s =>
                      !s.startsWith('2A') &&
                      'Text2 should specifically start with 2A'
                  : void 0
              }
            >
              Text {i}
            </Field>
          ))}
        </Formol>
      ),
      new Array(30).fill().reduce((rv, _, i) => {
        rv[`text${i}`] = `${i}${i === 2 ? 'A' : ''}${i.toString(36)}`
        return rv
      }, {}),
      item =>
        new Array(30).fill().reduce((rv, _, i) => {
          rv[`text${i}`] = item[`text${i}`].startsWith(i.toString())
            ? ''
            : `Text${i} must begin with {i}`
          return rv
        }, {})
    )
  )
