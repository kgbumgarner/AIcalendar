
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.1' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\Header.svelte generated by Svelte v3.46.1 */

    const file$3 = "src\\Header.svelte";

    function create_fragment$3(ctx) {
    	let h1;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "AI Calendar: 2022";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Roadmap of events for Alpha Iota";
    			add_location(h1, file$3, 0, 0, 0);
    			add_location(p, file$3, 1, 0, 28);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\Roadmap.svelte generated by Svelte v3.46.1 */

    const file$2 = "src\\Roadmap.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (34:8) {#each jan as e}
    function create_each_block_3(ctx) {
    	let li;
    	let t0_value = /*e*/ ctx[5].event + "";
    	let t0;
    	let t1;
    	let span;
    	let t2_value = /*e*/ ctx[5].date + "";
    	let t2;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = text(" on ");
    			span = element("span");
    			t2 = text(t2_value);
    			attr_dev(span, "class", "svelte-151qpsa");
    			add_location(span, file$2, 34, 110, 1194);

    			attr_dev(li, "class", "" + (null_to_empty(Date.parse(/*currentDate*/ ctx[4]) > Date.parse(/*e*/ ctx[5].dateString)
    			? "past"
    			: "upcoming") + " svelte-151qpsa"));

    			add_location(li, file$2, 34, 12, 1096);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			append_dev(li, span);
    			append_dev(span, t2);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(34:8) {#each jan as e}",
    		ctx
    	});

    	return block;
    }

    // (42:8) {#each feb as e}
    function create_each_block_2(ctx) {
    	let li;
    	let t0_value = /*e*/ ctx[5].event + "";
    	let t0;
    	let t1;
    	let span;
    	let t2_value = /*e*/ ctx[5].date + "";
    	let t2;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = text(" on ");
    			span = element("span");
    			t2 = text(t2_value);
    			attr_dev(span, "class", "svelte-151qpsa");
    			add_location(span, file$2, 42, 110, 1444);

    			attr_dev(li, "class", "" + (null_to_empty(Date.parse(/*currentDate*/ ctx[4]) > Date.parse(/*e*/ ctx[5].dateString)
    			? "past"
    			: "upcoming") + " svelte-151qpsa"));

    			add_location(li, file$2, 42, 12, 1346);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			append_dev(li, span);
    			append_dev(span, t2);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(42:8) {#each feb as e}",
    		ctx
    	});

    	return block;
    }

    // (50:8) {#each mar as e}
    function create_each_block_1(ctx) {
    	let li;
    	let t0_value = /*e*/ ctx[5].event + "";
    	let t0;
    	let t1;
    	let span;
    	let t2_value = /*e*/ ctx[5].date + "";
    	let t2;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = text(" on ");
    			span = element("span");
    			t2 = text(t2_value);
    			attr_dev(span, "class", "svelte-151qpsa");
    			add_location(span, file$2, 50, 110, 1691);

    			attr_dev(li, "class", "" + (null_to_empty(Date.parse(/*currentDate*/ ctx[4]) > Date.parse(/*e*/ ctx[5].dateString)
    			? "past"
    			: "upcoming") + " svelte-151qpsa"));

    			add_location(li, file$2, 50, 12, 1593);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			append_dev(li, span);
    			append_dev(span, t2);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(50:8) {#each mar as e}",
    		ctx
    	});

    	return block;
    }

    // (58:8) {#each apr as e}
    function create_each_block(ctx) {
    	let li;
    	let t0_value = /*e*/ ctx[5].event + "";
    	let t0;
    	let t1;
    	let span;
    	let t2_value = /*e*/ ctx[5].date + "";
    	let t2;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = text(" on ");
    			span = element("span");
    			t2 = text(t2_value);
    			attr_dev(span, "class", "svelte-151qpsa");
    			add_location(span, file$2, 58, 110, 1938);

    			attr_dev(li, "class", "" + (null_to_empty(Date.parse(/*currentDate*/ ctx[4]) > Date.parse(/*e*/ ctx[5].dateString)
    			? "past"
    			: "upcoming") + " svelte-151qpsa"));

    			add_location(li, file$2, 58, 12, 1840);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			append_dev(li, span);
    			append_dev(span, t2);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(58:8) {#each apr as e}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let h20;
    	let t1;
    	let div0;
    	let ul0;
    	let t2;
    	let h21;
    	let t4;
    	let div1;
    	let ul1;
    	let t5;
    	let h22;
    	let t7;
    	let div2;
    	let ul2;
    	let t8;
    	let h23;
    	let t10;
    	let div3;
    	let ul3;
    	let each_value_3 = /*jan*/ ctx[0];
    	validate_each_argument(each_value_3);
    	let each_blocks_3 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_3[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let each_value_2 = /*feb*/ ctx[1];
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*mar*/ ctx[2];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*apr*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			h20 = element("h2");
    			h20.textContent = "January";
    			t1 = space();
    			div0 = element("div");
    			ul0 = element("ul");

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].c();
    			}

    			t2 = space();
    			h21 = element("h2");
    			h21.textContent = "February";
    			t4 = space();
    			div1 = element("div");
    			ul1 = element("ul");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t5 = space();
    			h22 = element("h2");
    			h22.textContent = "March";
    			t7 = space();
    			div2 = element("div");
    			ul2 = element("ul");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t8 = space();
    			h23 = element("h2");
    			h23.textContent = "April";
    			t10 = space();
    			div3 = element("div");
    			ul3 = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h20, file$2, 30, 0, 1009);
    			attr_dev(ul0, "class", "svelte-151qpsa");
    			add_location(ul0, file$2, 32, 4, 1052);
    			attr_dev(div0, "class", "ulCon svelte-151qpsa");
    			add_location(div0, file$2, 31, 0, 1027);
    			add_location(h21, file$2, 38, 0, 1258);
    			attr_dev(ul1, "class", "svelte-151qpsa");
    			add_location(ul1, file$2, 40, 4, 1302);
    			attr_dev(div1, "class", "ulCon svelte-151qpsa");
    			add_location(div1, file$2, 39, 0, 1277);
    			add_location(h22, file$2, 46, 0, 1508);
    			attr_dev(ul2, "class", "svelte-151qpsa");
    			add_location(ul2, file$2, 48, 4, 1549);
    			attr_dev(div2, "class", "ulCon svelte-151qpsa");
    			add_location(div2, file$2, 47, 0, 1524);
    			add_location(h23, file$2, 54, 0, 1755);
    			attr_dev(ul3, "class", "svelte-151qpsa");
    			add_location(ul3, file$2, 56, 4, 1796);
    			attr_dev(div3, "class", "ulCon svelte-151qpsa");
    			add_location(div3, file$2, 55, 0, 1771);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h20, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, ul0);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].m(ul0, null);
    			}

    			insert_dev(target, t2, anchor);
    			insert_dev(target, h21, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, ul1);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(ul1, null);
    			}

    			insert_dev(target, t5, anchor);
    			insert_dev(target, h22, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, ul2);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(ul2, null);
    			}

    			insert_dev(target, t8, anchor);
    			insert_dev(target, h23, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, ul3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul3, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*Date, currentDate, jan*/ 17) {
    				each_value_3 = /*jan*/ ctx[0];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_3[i]) {
    						each_blocks_3[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_3[i] = create_each_block_3(child_ctx);
    						each_blocks_3[i].c();
    						each_blocks_3[i].m(ul0, null);
    					}
    				}

    				for (; i < each_blocks_3.length; i += 1) {
    					each_blocks_3[i].d(1);
    				}

    				each_blocks_3.length = each_value_3.length;
    			}

    			if (dirty & /*Date, currentDate, feb*/ 18) {
    				each_value_2 = /*feb*/ ctx[1];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(ul1, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			if (dirty & /*Date, currentDate, mar*/ 20) {
    				each_value_1 = /*mar*/ ctx[2];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(ul2, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*Date, currentDate, apr*/ 24) {
    				each_value = /*apr*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul3, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h20);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div0);
    			destroy_each(each_blocks_3, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(h21);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks_2, detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(h22);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(h23);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Roadmap', slots, []);

    	let jan = [
    		{
    			event: "S'mores Night",
    			date: "January 13th",
    			dateString: "2022-01-13",
    			class: ""
    		},
    		{ event: "Ski Lodge", date: "January 16th" },
    		{
    			event: "Formal Recruitment",
    			date: "January 18th - 20th"
    		},
    		{
    			event: "Informal Recruitment",
    			date: "January 24th - 28th"
    		}
    	];

    	let feb = [
    		{
    			event: "Chipotle Benefit Night",
    			date: "February 5th"
    		},
    		{
    			event: "Formal",
    			date: "February 11th - 13th"
    		},
    		{
    			event: "Mom's Weekend",
    			date: "February 18th - 20th"
    		},
    		{
    			event: "Mardi Gras Social w/ GPHI",
    			date: "February 23rd"
    		}
    	];

    	let mar = [
    		{
    			event: "Spring Break",
    			date: "March 5th - 13th"
    		},
    		{
    			event: "Social w/ Zeta and SK",
    			date: "March 19th"
    		},
    		{
    			event: "Bayou",
    			date: "March 25th - 26th"
    		}
    	];

    	let apr = [
    		{ event: "Fake Wedding", date: "April 9th" },
    		{
    			event: "War of The Roses",
    			date: "April 11th - 15th"
    		}
    	];

    	let currentDate = new Date();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Roadmap> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ jan, feb, mar, apr, currentDate });

    	$$self.$inject_state = $$props => {
    		if ('jan' in $$props) $$invalidate(0, jan = $$props.jan);
    		if ('feb' in $$props) $$invalidate(1, feb = $$props.feb);
    		if ('mar' in $$props) $$invalidate(2, mar = $$props.mar);
    		if ('apr' in $$props) $$invalidate(3, apr = $$props.apr);
    		if ('currentDate' in $$props) $$invalidate(4, currentDate = $$props.currentDate);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [jan, feb, mar, apr, currentDate];
    }

    class Roadmap extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Roadmap",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\Footer.svelte generated by Svelte v3.46.1 */

    const file$1 = "src\\Footer.svelte";

    function create_fragment$1(ctx) {
    	let img;
    	let img_src_value;
    	let t0;
    	let h2;
    	let t1;
    	let a;
    	let t2;

    	const block = {
    		c: function create() {
    			img = element("img");
    			t0 = space();
    			h2 = element("h2");
    			t1 = text("View on ");
    			a = element("a");
    			t2 = text("GitHub");
    			if (!src_url_equal(img.src, img_src_value = /*src*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Crest.");
    			attr_dev(img, "class", "svelte-18m1sfr");
    			add_location(img, file$1, 5, 0, 110);
    			attr_dev(a, "href", /*href*/ ctx[1]);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "svelte-18m1sfr");
    			add_location(a, file$1, 6, 12, 148);
    			attr_dev(h2, "class", "svelte-18m1sfr");
    			add_location(h2, file$1, 6, 0, 136);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t1);
    			append_dev(h2, a);
    			append_dev(a, t2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	let src = './PKP.png';
    	let href = 'https://github.com/kgbumgarner/AIcalendar';
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ src, href });

    	$$self.$inject_state = $$props => {
    		if ('src' in $$props) $$invalidate(0, src = $$props.src);
    		if ('href' in $$props) $$invalidate(1, href = $$props.href);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [src, href];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.46.1 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let header1;
    	let header0;
    	let t0;
    	let main;
    	let roadmap;
    	let t1;
    	let footer1;
    	let footer0;
    	let current;
    	header0 = new Header({ $$inline: true });
    	roadmap = new Roadmap({ $$inline: true });
    	footer0 = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			header1 = element("header");
    			create_component(header0.$$.fragment);
    			t0 = space();
    			main = element("main");
    			create_component(roadmap.$$.fragment);
    			t1 = space();
    			footer1 = element("footer");
    			create_component(footer0.$$.fragment);
    			attr_dev(header1, "class", "svelte-1r8lviv");
    			add_location(header1, file, 7, 0, 166);
    			add_location(main, file, 11, 0, 201);
    			attr_dev(footer1, "class", "svelte-1r8lviv");
    			add_location(footer1, file, 15, 0, 233);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header1, anchor);
    			mount_component(header0, header1, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(roadmap, main, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, footer1, anchor);
    			mount_component(footer0, footer1, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header0.$$.fragment, local);
    			transition_in(roadmap.$$.fragment, local);
    			transition_in(footer0.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header0.$$.fragment, local);
    			transition_out(roadmap.$$.fragment, local);
    			transition_out(footer0.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header1);
    			destroy_component(header0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(roadmap);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(footer1);
    			destroy_component(footer0);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Header, Roadmap, Footer });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
