import { boolean, number, text } from '@storybook/addon-knobs'
import React from 'react'

import Formol, { Field } from '../src'
import molecule from '../test/samples/molecule.svg.base64'

export const colorChoices = {
  White: '#ffffff',
  Silver: '#c0c0c0',
  Gray: '#808080',
  Black: 0,
  Red: '#ff0000',
  Maroon: '#800000',
  Yellow: '#ffff00',
  Olive: '#808000',
  Lime: '#00ff00',
  Green: '#008000',
  Aqua: '#00ffff',
  Teal: '#008080',
  Blue: '#0000ff',
  Navy: '#000080',
  Fuchsia: '#ff00ff',
  Purple: '#800080',
}

export const countries = [
  'Austria',
  'Belgium',
  'Bulgaria',
  'Croatia',
  'Cyprus',
  'Czech Republic',
  'Denmark',
  'Estonia',
  'Finland',
  'France',
  'Germany',
  'Greece',
  'Hungary',
  'Ireland',
  'Italy',
  'Latvia',
  'Lithuania',
  'Luxembourg',
  'Malta',
  'Netherlands',
  'Poland',
  'Portugal',
  'Romania',
  'Slovakia',
  'Slovenia',
  'Spain',
  'Sweden',
  'United Kingdom',
]

export const persons = [
  {
    id: 'mscott',
    name: 'Scott',
    firstname: 'Michael',
    gender: 'man',
  },
  {
    id: 'dkschrute',
    name: 'K. Schrute',
    firstname: 'Dwight',
    gender: 'man',
  },
  {
    id: 'jhalpert',
    name: 'Halpert',
    firstname: 'Jim',
    gender: 'man',
  },
  {
    id: 'pbeesly',
    name: 'Beesly',
    firstname: 'Pam',
    gender: 'woman',
  },
  {
    id: 'rhoward',
    name: 'Howard',
    firstname: 'Ryan',
    gender: 'man',
  },
]

// eslint-disable-next-line react/display-name
const makeField = (name, extraProps) => props => (
  <Field type={name} name={name} {...extraProps} {...props}>
    {name}
  </Field>
)

const extrasProps = {
  'checkbox-set': { choices: colorChoices },
  'radio-set': { choices: colorChoices },
  select: { choices: colorChoices },
  'select-menu': { choices: colorChoices },
}

export const typeFields = Object.keys(Formol.defaultTypes).reduce(
  (fields, name) => {
    fields[name] = makeField(name, extrasProps[name])
    return fields
  },
  {}
)

export const testFieldValue = name =>
  ({
    area: 'Text\nArea',
    email: 'email@exemple.com',
    number: 12,
    range: 42,
    tel: '541-754-3010',
    radio: true,
    checkbox: true,
    'checkbox-set': ['#800000', '#ffff00'],
    'radio-set': '#ffff00',
    select: '#800000',
    'select-menu': '#800000',
    'select-menu-multiple': ['#800000', '#ffff00'],
    color: '#123456',
    money: '12.50',
    html:
      '<p><span style="color: rgb(251,160,38);">H</span><strong>T</strong><del>M</del><em>L</em></p>', // eslint-disable-line max-len
    calendar: '2018-08-01',
    date: '2018-08-01',
    time: '17:14',
    switch: true,
    'datetime-local': '2018-08-01T17:14',
    week: '2018-W12',
    month: '2018-08',
    file: {
      data: molecule,
      ext: 'svg',
      name: 'formol',
      size: 1086,
      type: 'image/svg+xml',
    },
  }[name] || name)

export const knobs = name => {
  const knob = {
    title: text('Title', name, name),
    required: boolean('Required', false, name),
    readOnly: boolean('Read Only', false, name),
    disabled: boolean('Disabled', false, name),
    autoFocus: boolean('AutoFocus', false, name),
    placeholder: text('PlaceHolder', name, name),
    unit: text('Unit', '', name),
  }
  if (name === 'file') {
    knob.accept = text('Accept', 'image/*', name)
  }
  if (['file', 'select', 'select-menu'].includes(name)) {
    knob.multiple = boolean('Multiple', false, name)
  }
  if (['number', 'range', 'money'].includes(name)) {
    knob.min = number('Min', null, name)
    knob.max = number('Max', null, {}, name)
    knob.step = number('Step', null, {}, name)
  }
  if (name === 'range') {
    knob.noLabels = boolean('No Labels', false, name)
  }
  if (['text', 'search', 'tel', 'url', 'email', 'password'].includes(name)) {
    knob.size = number('Size', null, {}, name)
  }
  if (name === 'money') {
    knob.precision = number('Precision', null, {}, name)
  }
  if (name === 'select-menu') {
    knob.virtualizedThreshold = number('Virtualized Threshold', null, {}, name)
  }
  return knob
}
