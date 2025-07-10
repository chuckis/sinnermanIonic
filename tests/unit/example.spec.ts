import { mount } from '@vue/test-utils'
import Tab1Page from '@/views/AboutPage.vue'
import { describe, expect, test } from 'vitest'

describe('AboutPage.vue', () => {
  test('renders tab 1 Tab1Page', () => {
    const wrapper = mount(Tab1Page)
    expect(wrapper.text()).toMatch('Tab 1 page')
  })
})
