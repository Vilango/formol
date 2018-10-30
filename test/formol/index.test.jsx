/* eslint-disable react/no-multi-comp */

import React from 'react'

import { mount } from 'enzyme'

import { forCondition } from '../helpers'
import Formol, { Field } from '../../src'
import InputField from '../../src/fields/InputField'

describe('Formol', () => {
  it('is mountable and unmountable', () => {
    const wrapper = mount(<Formol />)
    expect(wrapper.find('form')).toBeTruthy()
    expect(wrapper.unmount()).toBeTruthy()
  })
  it('does not contains a submit button by default', () => {
    const wrapper = mount(<Formol />)
    expect(wrapper.find('.Formol_Formol__submit')).toHaveLength(0)
  })
  it('contains a submit button when onSubmit is provided', () => {
    const wrapper = mount(<Formol onSubmit={() => {}} />)
    expect(wrapper.find('.Formol_Formol__submit')).toBeTruthy()
    expect(wrapper.find('.Formol_Formol__submit').text()).toEqual('Submit')
  })
  it('contains a cancel button', () => {
    const wrapper = mount(<Formol onSubmit={() => {}} />)
    expect(wrapper.find('.Formol_Formol__cancel')).toBeTruthy()
    expect(wrapper.find('.Formol_Formol__cancel').text()).toEqual('Cancel')
  })
  it('contains nothing else', () => {
    const wrapper = mount(<Formol onSubmit={() => {}} />)
    expect(
      wrapper
        .find('form')
        .children()
        .map(e => e.type())
    ).toEqual(['input', 'button', 'button'])
  })
  it('does nothing on form submit', async () => {
    const onSubmit = jest.fn()
    const wrapper = mount(<Formol onSubmit={onSubmit} />)
    await wrapper.find('form').simulate('submit')
    expect(onSubmit).not.toHaveBeenCalled()
  })
  it('renders extra attribute', () => {
    const onSubmit = jest.fn()
    const wrapper = mount(
      <Formol
        onSubmit={onSubmit}
        item={{ text: 'foo' }}
        extra={({ context: { transientItem } }) => (
          <code>{JSON.stringify(transientItem)}</code>
        )}
      >
        <Field type="text">Text</Field>
      </Formol>
    )

    expect(wrapper.find('code').text()).toEqual('{"text":"foo"}')
    expect(
      wrapper
        .find('form')
        .children()
        .map(p => p.type())
        .slice(1)
    ).toEqual(['input', 'button', 'button', 'code'])
  })
  it(
    'handles server field errors',
    async () => {
      const onSubmit = jest.fn(
        ({ text }) =>
          ({
            bar: { text: 'Server side error' },
            baz: {},
          }[text])
      )
      const wrapper = mount(
        <Formol onSubmit={onSubmit} item={{ text: 'foo' }}>
          <Field type="text">Text</Field>
        </Formol>
      )
      const input = () =>
        wrapper
          .find('Field')
          .find('input')
          .first()
      const submit = () => wrapper.find('.Formol_Formol__submit')
      const cancel = () => wrapper.find('.Formol_Formol__cancel')

      expect(submit().props().disabled).toBeTruthy()
      expect(cancel().props().disabled).toBeTruthy()
      expect(input().props().type).toEqual('text')
      expect(input().props().value).toEqual('foo')

      await input().simulate('focus')
      await input().simulate('change', { target: { value: 'bar' } })
      await input().simulate('blur')

      expect(input().props().value).toEqual('bar')
      expect(submit().props().disabled).toBeFalsy()
      expect(cancel().props().disabled).toBeFalsy()

      expect(wrapper.find('.Formol_Field__error-text').length).toEqual(0)

      await submit().simulate('click')

      expect(onSubmit).toHaveBeenCalled()
      expect(onSubmit).toHaveBeenCalledWith({ text: 'bar' }, { text: 'foo' }, [
        'text',
      ])
      await forCondition(
        () => wrapper.find('.Formol_Field__error-text').length,
        wrapper
      )
      expect(wrapper.find('.Formol_Field__error-text').text()).toEqual(
        'Server side error'
      )
      expect(input().props().value).toEqual('bar')

      await input().simulate('focus')
      await input().simulate('change', { target: { value: 'baz' } })
      await input().simulate('blur')

      await submit().simulate('click')

      expect(onSubmit).toHaveBeenCalled()
      expect(onSubmit).toHaveBeenCalledWith({ text: 'baz' }, { text: 'foo' }, [
        'text',
      ])
      await forCondition(
        () => !wrapper.find('.Formol_Field__error-text').length,
        wrapper
      )
      expect(wrapper.find('.Formol_Field__error-text').length).toEqual(0)
      expect(input().props().value).toEqual('baz')
    },
    30000
  )
  it('can become readonly', async () => {
    const onSubmit = jest.fn()
    class ReadOnlyChanger extends React.Component {
      state = {
        readOnly: false,
      }

      render() {
        const { readOnly } = this.state
        return (
          <Formol onSubmit={onSubmit} readOnly={readOnly}>
            <a
              className="changer"
              onClick={() => this.setState({ readOnly: true })}
            />
            <Field>Text</Field>
          </Formol>
        )
      }
    }
    const wrapper = mount(<ReadOnlyChanger />)
    const input = () =>
      wrapper
        .find('Field')
        .find('input')
        .first()
    const changer = () => wrapper.find('.changer')

    expect(input().props().readOnly).toBeFalsy()

    await changer().simulate('click')

    expect(input().props().readOnly).toBeTruthy()
  })
  it('can change item', async () => {
    const onSubmit = jest.fn()
    class ItemChanger extends React.Component {
      state = {
        item: { text: 'foo' },
      }

      render() {
        const { item } = this.state
        return (
          <Formol onSubmit={onSubmit} item={item}>
            <a
              className="changer"
              onClick={() => this.setState({ item: { text: 'baz' } })}
            />
            <Field>Text</Field>
          </Formol>
        )
      }
    }
    const wrapper = mount(<ItemChanger />)
    const input = () =>
      wrapper
        .find('Field')
        .find('input')
        .first()
    const changer = () => wrapper.find('.changer')

    const submit = () => wrapper.find('.Formol_Formol__submit')
    const cancel = () => wrapper.find('.Formol_Formol__cancel')

    expect(submit().props().disabled).toBeTruthy()
    expect(cancel().props().disabled).toBeTruthy()

    expect(input().props().type).toEqual('text')
    expect(input().props().value).toEqual('foo')

    await input().simulate('focus')
    await input().simulate('change', { target: { value: 'bar' } })
    await input().simulate('blur')

    expect(input().props().value).toEqual('bar')
    expect(submit().props().disabled).toBeFalsy()
    expect(cancel().props().disabled).toBeFalsy()

    await changer().simulate('click')

    expect(input().props().value).toEqual('baz')
    expect(submit().props().disabled).toBeTruthy()
    expect(cancel().props().disabled).toBeTruthy()
  })
  it('can change types', async () => {
    const onSubmit = jest.fn()
    const VolumeField = () => <InputField type="volume" />
    const TemperatureField = () => <InputField type="temperature" />

    class ReadOnlyChanger extends React.Component {
      state = {
        types: { other: VolumeField },
      }

      render() {
        const { types } = this.state
        return (
          <Formol onSubmit={onSubmit} types={types}>
            <a
              className="changer"
              onClick={() =>
                this.setState({ types: { other: TemperatureField } })
              }
            />
            <Field type="other">Text</Field>
          </Formol>
        )
      }
    }
    const wrapper = mount(<ReadOnlyChanger />)
    const input = () =>
      wrapper
        .find('Field')
        .find('input')
        .first()
    const changer = () => wrapper.find('.changer')

    expect(input().props().type).toEqual('volume')

    await changer().simulate('click')

    expect(input().props().type).toEqual('temperature')
  })
  it('can change lang', async () => {
    const onSubmit = jest.fn()
    class I18nChanger extends React.Component {
      state = {
        i18n: 'en',
      }

      render() {
        const { i18n } = this.state
        return (
          <Formol onSubmit={onSubmit} i18n={i18n}>
            <a
              className="changer"
              onClick={() => this.setState({ i18n: 'fr' })}
            />
            <Field>Text</Field>
          </Formol>
        )
      }
    }
    const wrapper = mount(<I18nChanger />)

    const submit = () => wrapper.find('.Formol_Formol__submit')
    const cancel = () => wrapper.find('.Formol_Formol__cancel')
    const changer = () => wrapper.find('.changer')

    expect(submit().text()).toEqual('Submit')
    expect(cancel().text()).toEqual('Cancel')

    await changer().simulate('click')

    expect(submit().text()).toEqual('Envoyer')
    expect(cancel().text()).toEqual('Annuler')
  })
  it('validates the form with validator', async () => {
    const onSubmit = jest.fn()
    const wrapper = mount(
      <Formol
        onSubmit={onSubmit}
        item={{ number1: 42, number2: 49 }}
        validator={({ number1, number2 }) => ({
          number2:
            number2 <= number1
              ? 'Number 2 should be greater than Number 1'
              : '',
        })}
      >
        <Field type="number" max={2000}>
          Number 1
        </Field>
        <Field type="number" max={50}>
          Number 2
        </Field>
      </Formol>
    )
    const input1 = () =>
      wrapper
        .find('Field')
        .find('input')
        .first()
    const input2 = () =>
      wrapper
        .find('Field')
        .find('input')
        .at(1)
    const submit = () => wrapper.find('.Formol_Formol__submit')
    const cancel = () => wrapper.find('.Formol_Formol__cancel')

    expect(submit().props().disabled).toBeTruthy()
    expect(cancel().props().disabled).toBeTruthy()
    expect(input1().props().type).toEqual('number')
    expect(input1().props().value).toEqual(42)
    expect(input2().props().type).toEqual('number')
    expect(input2().props().value).toEqual(49)

    await input2().simulate('focus')
    await input2().simulate('change', { target: { value: 21 } })
    await input2().simulate('blur')

    expect(wrapper.find('.Formol_Field__error-text').text()).toEqual(
      'Number 2 should be greater than Number 1'
    )

    expect(input2().props().value).toEqual(21)
    expect(submit().props().disabled).toBeFalsy()
    expect(cancel().props().disabled).toBeFalsy()

    await submit().simulate('click')

    expect(onSubmit).not.toHaveBeenCalled()

    expect(input2().props().value).toEqual(21)

    await input2().simulate('focus')
    await input2().simulate('change', { target: { value: 43 } })
    await input2().simulate('blur')
    expect(wrapper.find('.Formol_Field__error-text').length).toEqual(0)

    await submit().simulate('click')

    expect(onSubmit).toHaveBeenCalled()
    expect(onSubmit).toHaveBeenCalledWith(
      { number1: 42, number2: 43 },
      { number1: 42, number2: 49 },
      ['number1', 'number2']
    )
    expect(input1().props().value).toEqual(42)
    expect(input2().props().value).toEqual(43)
  })
  it(
    'errors on bad submit return value',
    async () => {
      jest.spyOn(console, 'error')
      const consoleErrorTracer = jest.fn()
      global.console.error.mockImplementation(consoleErrorTracer)
      const onSubmit = () => ({ badValue: 12 })

      const wrapper = mount(
        <Formol onSubmit={onSubmit} item={{ text: 'foo' }}>
          <Field type="text">Text</Field>
        </Formol>
      )
      const input = () =>
        wrapper
          .find('Field')
          .find('input')
          .first()
      const submit = () => wrapper.find('.Formol_Formol__submit')
      const cancel = () => wrapper.find('.Formol_Formol__cancel')

      expect(submit().props().disabled).toBeTruthy()
      expect(cancel().props().disabled).toBeTruthy()
      expect(input().props().type).toEqual('text')
      expect(input().props().value).toEqual('foo')

      await input().simulate('focus')
      await input().simulate('change', { target: { value: 'foo bar' } })
      await input().simulate('blur')

      expect(input().props().value).toEqual('foo bar')
      expect(submit().props().disabled).toBeFalsy()
      expect(cancel().props().disabled).toBeFalsy()

      await submit().simulate('click')

      await forCondition(() => consoleErrorTracer.mock.calls.length, wrapper)

      expect(consoleErrorTracer).toHaveBeenCalled()
      expect(consoleErrorTracer).toHaveBeenCalledWith(
        'onSubmit return value must be a mapping of server errors ' +
          "(ie: { fieldName: 'error' }) got:",
        { badValue: 12 }
      )

      expect(input().props().value).toEqual('foo bar')
      global.console.error.mockRestore()
    },
    30000
  )
  it(
    'use reportValidity on submit if available',
    async () => {
      const onSubmit = jest.fn()
      const wrapper = mount(
        <Formol onSubmit={onSubmit} item={{ number: 31 }}>
          <Field type="number" max={2000}>
            Number
          </Field>
        </Formol>
      )
      const input = () =>
        wrapper
          .find('Field')
          .find('input')
          .first()
      const submit = () => wrapper.find('.Formol_Formol__submit')
      const cancel = () => wrapper.find('.Formol_Formol__cancel')

      expect(submit().props().disabled).toBeTruthy()
      expect(cancel().props().disabled).toBeTruthy()
      expect(input().props().type).toEqual('number')
      expect(input().props().value).toEqual(31)

      await input().simulate('focus')
      await input().simulate('change', { target: { value: 9999 } })
      await input().simulate('blur')

      expect(wrapper.find('.Formol_Field__error-text').text()).toEqual(
        'Constraints not satisfied'
      )
      expect(input().props().value).toEqual(9999)
      expect(submit().props().disabled).toBeFalsy()
      expect(cancel().props().disabled).toBeFalsy()

      const reportValidity = jest.spyOn(
        wrapper.instance().form.current,
        'reportValidity'
      )

      await submit().simulate('click')

      await forCondition(() => reportValidity.mock.calls.length, wrapper)

      expect(reportValidity).toHaveBeenCalled()

      expect(onSubmit).not.toHaveBeenCalled()
    },
    30000
  )
  it(
    'use hidden input if reportValidity is not available',
    async () => {
      const onSubmit = jest.fn()
      const wrapper = mount(
        <Formol onSubmit={onSubmit} item={{ number: 31 }}>
          <Field type="number" max={2000}>
            Number
          </Field>
        </Formol>
      )
      const input = () =>
        wrapper
          .find('Field')
          .find('input')
          .first()
      const submit = () => wrapper.find('.Formol_Formol__submit')
      const cancel = () => wrapper.find('.Formol_Formol__cancel')

      expect(submit().props().disabled).toBeTruthy()
      expect(cancel().props().disabled).toBeTruthy()
      expect(input().props().type).toEqual('number')
      expect(input().props().value).toEqual(31)

      await input().simulate('focus')
      await input().simulate('change', { target: { value: 9999 } })
      await input().simulate('blur')

      expect(wrapper.find('.Formol_Field__error-text').text()).toEqual(
        'Constraints not satisfied'
      )
      expect(input().props().value).toEqual(9999)
      expect(submit().props().disabled).toBeFalsy()
      expect(cancel().props().disabled).toBeFalsy()

      wrapper.instance().form.current.reportValidity = null

      const submitSpy = jest.spyOn(wrapper.instance().submit.current, 'click')

      await submit().simulate('click')

      await forCondition(() => submitSpy.mock.calls.length, wrapper)

      expect(submitSpy).toHaveBeenCalled()

      expect(onSubmit).not.toHaveBeenCalled()
    },
    30000
  )
  it(
    'resets form values after submit if not item was given',
    async () => {
      const onSubmit = jest.fn()
      const wrapper = mount(
        <Formol onSubmit={onSubmit}>
          <Field type="text">Text</Field>
        </Formol>
      )
      const input = () =>
        wrapper
          .find('Field')
          .find('input')
          .first()
      const submit = () => wrapper.find('.Formol_Formol__submit')
      const cancel = () => wrapper.find('.Formol_Formol__cancel')

      expect(submit().props().disabled).toBeTruthy()
      expect(cancel().props().disabled).toBeTruthy()
      expect(input().props().type).toEqual('text')
      expect(input().props().value).toEqual('')

      await input().simulate('focus')
      await input().simulate('change', { target: { value: 'foo bar' } })
      await input().simulate('blur')

      expect(input().props().value).toEqual('foo bar')
      expect(submit().props().disabled).toBeFalsy()
      expect(cancel().props().disabled).toBeFalsy()

      await submit().simulate('click')

      expect(onSubmit).toHaveBeenCalled()
      expect(onSubmit).toHaveBeenCalledWith({ text: 'foo bar' }, {}, ['text'])
      await forCondition(() => !input().props().value, wrapper)
      expect(input().props().value).toEqual('')
    },
    30000
  )
  it('honors focusNextOnEnter', async () => {
    const wrapper = mount(
      <Formol focusNextOnEnter>
        <Field type="text">Text</Field>
        <Field type="number">Number</Field>
        <Field type="area">Area</Field>
      </Formol>
    )

    const input = n =>
      n === 2
        ? wrapper
            .find('Field')
            .find('textarea')
            .first()
        : wrapper
            .find('Field')
            .find('input')
            .at(n)

    await input(0).simulate('focus')
    await input(0).simulate('keydown', { keyCode: 13 })
    await input(1).simulate('keydown', { keyCode: 13 })
    await input(2).simulate('keydown', { keyCode: 13 })
    await input(2).simulate('keydown', { keyCode: 13, ctrlKey: true })
    await input(0).simulate('keydown', { keyCode: 13 })
    await input(1).simulate('keydown', { keyCode: 13, shiftKey: true })

    await input(0).simulate('keydown', { keyCode: 47 })
  })
})
