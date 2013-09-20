/*!
 * @licence Echolot
 * Copyright (C) 2008-2011 eXXcellent Solutions GmbH.
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 * http://exxcellent.github.io/echolot/
 */
/*
 * This file is part of the Echolot Project. This project is a
 * collection of Components that have extended the Echo Web Application
 * Framework Version 3.
 * The core library for the echolot components.
 * @see Alternative: http://echo.nextapp.com/site/node/5435 
 */

/**
 * The exxcellent namespace contains all components and rendering peers.
 */
exxcellent =
{
    /**
     * Maintains a unique id for the exxcellent namespace.
     *
     * @type Number
     */
    uniqueId: 20090526
};

/**
 * The exxcellent namespace contains all components and rendering peers.
 */
exxcellent.model =
{
    /**
     * Maintains a unique id for the exxcellent model namespace.
     *
     * @type Number
     */
    uniqueId: 20090609
};

/**
 * The exxcellent namespace contains all components and rendering peers.
 */
exxcellent.config =
{
    /**
     * Maintains a unique id for the exxcellent config namespace.
     *
     * @type Number
     */
    uniqueId: 20090610
};

/**
 * The Contrib namespace contains all components from the echo3 contribution forum.
 */
Contrib = {
    uniqueId: 20090525
};


/**
 * Here's another trivial free client-side component. This one allows you to create a button with
 * rollover effects that contains children. License for this component is public domain (use it however you like).
 * @see http://echo.nextapp.com/site/node/5146
 */
Contrib.ContainerButton = Core.extend(Echo.Component, {

    componentType: "Contrib.ContainerButton",

    doAction: function () {
        this.fireEvent({ type: "action", source: this, actionCommand: this.render("actionCommand") });
    }
});

/**
 * Synchronization peer for ContainerButton component.
 */
Contrib.ContainerButtonSync = Core.extend(Echo.Render.ComponentSync, {

    $load: function () {
        Echo.Render.registerPeer("Contrib.ContainerButton", this);
    },

    _div: null,

    _processRolloverEnter: function (e) {
        var backgroundImage = Echo.Sync.getEffectProperty(this.component, "backgroundImage", "rolloverBackgroundImage", true);
        Echo.Sync.FillImage.renderClear(backgroundImage, this._div);
        Echo.Sync.Color.renderClear(this.component.render("rolloverForeground"), this._div, "color");
        Echo.Sync.Color.renderClear(this.component.render("rolloverBackground"), this._div, "backgroundColor");
    },

    _processRolloverExit: function (e) {
        Echo.Sync.FillImage.renderClear(this.component.render("backgroundImage"), this._div);
        Echo.Sync.Color.renderClear(this.component.render("foreground"), this._div, "color");
        Echo.Sync.Color.renderClear(this.component.render("background"), this._div, "backgroundColor");
    },

    _processClick: function (e) {
        this.component.doAction();
    },

    renderAdd: function (update, parentElement) {
        this._div = document.createElement("div");
        this._div.style.cssText = "cursor: pointer;";
        Echo.Sync.Insets.render(this.component.render("insets"), this._div, "padding");
        Echo.Sync.Font.render(this.component.render("font"), this._div);
        Echo.Sync.Color.renderFB(this.component, this._div);
        Echo.Sync.Border.render(this.component.render("border"), this._div);
        Echo.Sync.FillImage.render(this.component.render("backgroundImage"), this._div);

        if (this.component.children.length == 1) {
            Echo.Render.renderComponentAdd(update, this.component.children[0], this._div);
        } else if (this.component.children.length !== 0) {
            throw new Error("Too many children in ContainerButton (max is 1).");
        }

        Core.Web.Event.add(this._div, "click", Core.method(this, this._processClick), false);

        if (this.component.render("rolloverEnabled")) {
            Core.Web.Event.add(this._div, "mouseover", Core.method(this, this._processRolloverEnter), false);
            Core.Web.Event.add(this._div, "mouseout", Core.method(this, this._processRolloverExit), false);
        }
        parentElement.appendChild(this._div);
    },

    renderDispose: function (update) {
        Core.Web.Event.removeAll(this._div);
        this._div = null;
    },

    renderUpdate: function (update) {
        var element = this._div;
        var containerElement = element.parentNode;
        this.renderDispose(update);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return true;
    }
});
Contrib.ScrollPane = Core.extend(Echo.Component, {

    $load: function () {
        Echo.ComponentFactory.registerType("Contrib.ScrollPane", this);
    },

    componentType: "Contrib.ScrollPane",

    cellElementNodeName: "div",
    prevFocusKey: 38,
    prevFocusFlag: Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_UP,
    nextFocusKey: 40,
    nextFocusFlag: Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_DOWN

});

Contrib.ScrollPane.Peer = Core.extend(Echo.Render.ComponentSync, {

    $load: function () {
        Echo.Render.registerPeer("Contrib.ScrollPane", this);
    },

    $abstract: {
        cellElementNodeName: true,

        renderChildLayoutData: function (child, cellElement) {
        }
    },

    element: null,
    containerElement: null,
    spacingPrototype: null,
    cellSpacing: null,
    _childIdToElementMap: null,

    processKeyPress: function (e) {
        switch (e.keyCode) {
            case this.prevFocusKey:
            case this.nextFocusKey:
                var focusPrevious = e.keyCode == this.prevFocusKey;
                var focusedComponent = this.component.application.getFocusedComponent();
                if (focusedComponent && focusedComponent.peer && focusedComponent.peer.getFocusFlags) {
                    var focusFlags = focusedComponent.peer.getFocusFlags();
                    if ((focusPrevious && focusFlags & this.prevFocusFlag) || (!focusPrevious && focusFlags & this.nextFocusFlag)) {
                        var focusChild = this.component.application.focusManager.findInParent(this.component, focusPrevious);
                        if (focusChild) {
                            this.component.application.setFocusedComponent(focusChild);
                            Core.Web.DOM.preventEventDefault(e);
                            return false;
                        }
                    }
                }
                break;
        }
        return true;
    },

    renderAdd: function (update, parentElement) {


        this.element = this.containerElement = document.createElement("div");
        this.element.id = "scrollPane" + this.component.renderId;
        this.element.style.overflow = "auto";
        this.element.style.outlineStyle = "none";
        this.element.tabIndex = "-1";
        var layoutData = this.component.render("layoutData");
        if (layoutData) {
            if (layoutData.height) {
                this.element.style.height = Echo.Sync.Extent.toPixels(layoutData.height, false) + "px";
            }
            Echo.Sync.Insets.render(layoutData.insets, parentElement, "padding");
        }

        Echo.Sync.Border.render(this.component.render("border"), this.element);
        Echo.Sync.Color.renderFB(this.component, this.element);
        Echo.Sync.Font.render(this.component.render("font"), this.element);
        Echo.Sync.Insets.render(this.component.render("insets"), this.element, "padding");

        this.cellSpacing = Echo.Sync.Extent.toPixels(this.component.render("cellSpacing"), false);
        if (this.cellSpacing) {
            this.spacingPrototype = document.createElement("div");
            this.spacingPrototype.style.height = this.cellSpacing + "px";
            this.spacingPrototype.style.fontSize = "1px";
            this.spacingPrototype.style.lineHeight = "0";
        }

        this.renderAddChildren(update);

        parentElement.appendChild(this.element);
    },

    renderChildLayoutData: function (child, cellElement) {
        var layoutData = child.render("layoutData");
        if (layoutData) {
            Echo.Sync.Color.render(layoutData.background, cellElement, "backgroundColor");
            Echo.Sync.FillImage.render(layoutData.backgroundImage, cellElement);
            Echo.Sync.Insets.render(layoutData.insets, cellElement, "padding");
            Echo.Sync.Alignment.render(layoutData.alignment, cellElement, true, this.component);
            if (layoutData.height) {
                cellElement.style.height = Echo.Sync.Extent.toPixels(layoutData.height, false) + "px";
            }
        }
    },

    renderAddChild: function (update, child, index) {
        var cellElement = document.createElement(this.cellElementNodeName);
        this._childIdToElementMap[child.renderId] = cellElement;
        Echo.Render.renderComponentAdd(update, child, cellElement);

        this.renderChildLayoutData(child, cellElement);

        if (index !== null && typeof index != 'undefined') {
            var currentChildCount;
            if (this.containerElement.childNodes.length >= 3 && this.cellSpacing) {
                currentChildCount = (this.containerElement.childNodes.length + 1) / 2;
            } else {
                currentChildCount = this.containerElement.childNodes.length;
            }
            if (index == currentChildCount) {
                index = null;
            }
        }
        if (index === null || typeof index == 'undefined' || !this.containerElement.firstChild) {
            // Full render, append-at-end scenario, or index 0 specified and no children rendered.

            // Render spacing cell first if index != 0 and cell spacing enabled.
            if (this.cellSpacing && this.containerElement.firstChild) {
                this.containerElement.appendChild(this.spacingPrototype.cloneNode(false));
            }

            // Render child cell second.
            this.containerElement.appendChild(cellElement);
        } else {
            // Partial render insert at arbitrary location scenario (but not at end)
            var insertionIndex = this.cellSpacing ? index * 2 : index;
            var beforeElement = this.containerElement.childNodes[insertionIndex];

            // Render child cell first.
            this.containerElement.insertBefore(cellElement, beforeElement);

            // Then render spacing cell if required.
            if (this.cellSpacing) {
                this.containerElement.insertBefore(this.spacingPrototype.cloneNode(false), beforeElement);
            }
        }
    },

    renderAddChildren: function (update) {
        this._childIdToElementMap = {};

        var componentCount = this.component.getComponentCount();
        for (var i = 0; i < componentCount; ++i) {
            var child = this.component.getComponent(i);
            this.renderAddChild(update, child);
        }

        Core.Web.Event.add(this.element,
            Core.Web.Env.QUIRK_IE_KEY_DOWN_EVENT_REPEAT ? "keydown" : "keypress",
            Core.method(this, this.processKeyPress), false);
    },

    renderDispose: function (update) {
        Core.Web.Event.removeAll(this.element);
        this.element = null;
        this.containerElement = null;
        this._childIdToElementMap = null;
        this.spacingPrototype = null;
    },

    renderRemoveChild: function (update, child) {
        var childElement = this._childIdToElementMap[child.renderId];
        if (!childElement) {
            return;
        }

        if (this.cellSpacing) {
            // If cell spacing is enabled, remove a spacing element, either before or after the removed child.
            // In the case of a single child existing in the Row, no spacing element will be removed.
            if (childElement.previousSibling) {
                this.containerElement.removeChild(childElement.previousSibling);
            } else if (childElement.nextSibling) {
                this.containerElement.removeChild(childElement.nextSibling);
            }
        }

        this.containerElement.removeChild(childElement);

        delete this._childIdToElementMap[child.renderId];
    },

    renderUpdate: function (update) {
        var fullRender = false;
        if (update.hasUpdatedProperties() || update.hasUpdatedLayoutDataChildren()) {
            // Full render
            fullRender = true;
        } else {
            var removedChildren = update.getRemovedChildren();
            var i;
            if (removedChildren) {
                // Remove children.
                for (i = 0; i < removedChildren.length; ++i) {
                    this.renderRemoveChild(update, removedChildren[i]);
                }
            }
            var addedChildren = update.getAddedChildren();
            if (addedChildren) {
                // Add children.
                for (i = 0; i < addedChildren.length; ++i) {
                    this.renderAddChild(update, addedChildren[i], this.component.indexOf(addedChildren[i]));
                }
            }
        }
        if (fullRender) {
            var element = this.element;
            var containerElement = element.parentNode;
            Echo.Render.renderComponentDispose(update, update.parent);
            containerElement.removeChild(element);
            this.renderAdd(update, containerElement);
        }

        return fullRender;
    }

});
/**
 * Component implementation for a Spin Button
 */
exxcellent.SpinButton = Core.extend(Echo.Component, {

    $load: function () {
        Echo.ComponentFactory.registerType("exxcellent.SpinButton", this);
    },

    doAction: function () {
        this.fireEvent({
            type: "action",
            source: this,
            actionCommand: this.get("actionCommand")
        });
    },

    componentType: "exxcellent.SpinButton",
    focusable: true
});

/**
 * Component rendering peer: SpinButton
 */
exxcellent.SpinButton.Sync = Core.extend(Echo.Render.ComponentSync, {

    $load: function () {
        Echo.Render.registerPeer("exxcellent.SpinButton", this);
    },

    _div: null,
    _decSpan: null,
    _input: null,

    renderAdd: function (update, parentElement) {
        this._div = document.createElement("div");
        this._div.id = this.component.renderId;

        this._decSpan = document.createElement("span");
        this._decSpan.style.cursor = "pointer";
        this._decSpan.appendChild(document.createTextNode("<"));
        this._div.appendChild(this._decSpan);

        var value = this.component.get("value");
        this._input = document.createElement("input");
        this._input.type = "text";
        this._input.value = !value ? "0" : parseInt(value, 10);
        this._input.style.textAlign = "right";
        this._div.appendChild(this._input);

        this._incSpan = document.createElement("span");
        this._incSpan.setAttribute("tabindex", 0);

        this._incSpan.appendChild(document.createTextNode(">"));
        this._incSpan.style.cursor = "pointer";
        this._div.appendChild(this._incSpan);

        // Register the events for _process methods
        Core.Web.Event.add(this._decSpan, "click",
            Core.method(this, this._processDecrement), false);
        Core.Web.Event.add(this._incSpan, "click",
            Core.method(this, this._processIncrement), false);
        Core.Web.Event.add(this._input, "change",
            Core.method(this, this._processTextChange), false);

        // Register Key up events for actions
        Core.Web.Event.add(this._input, "keyup",
            Core.method(this, this._processKeyUp), false);

        parentElement.appendChild(this._div);
    },

    renderDispose: function (update) {
        // Unregister the events
        Core.Web.Event.removeAll(this._decSpan);
        Core.Web.Event.removeAll(this._incSpan);
        Core.Web.Event.removeAll(this._input);

        this._decSpan = null;
        this._input = null;
        this._incSpan = null;
        this._div = null;
    },

    renderUpdate: function (update) {
        var element = this._div;
        var containerElement = element.parentNode;
        Echo.Render.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return true;
    },

    _processDecrement: function (e) {
        var value = parseInt(this._input.value, 10);
        value--;
        this._input.value = isNaN(value) ? 0 : value;
        this.component.set("value", value);
    },

    _processIncrement: function (e) {
        var value = parseInt(this._input.value, 10);
        value++;
        this._input.value = isNaN(value) ? 0 : value;
        this.component.set("value", value);
    },

    _processTextChange: function (e) {
        var value = parseInt(this._input.value, 10);
        this._input.value = isNaN(value) ? 0 : value;
        this.component.set("value", value);
    },

    // if ENTER key was pressed doAction!
    _processKeyUp: function (e) {
        if (e.keyCode == 13) {
            this.component.doAction();
        }
        if (e.keyCode == 38) {
            this._processIncrement(e);
        }
        if (e.keyCode == 40) {
            this._processDecrement(e);
        }
    },

    renderFocus: function () {
        Core.Web.DOM.focusElement(this._incSpan);
    }

});
/**
 * This is a text area component that expands to fill a pane. Resizing the pane
 * will grow/shrink the text area appropriately. It's not 100% finished at the
 * moment (border size calculation doesn't work properly with borders with
 * variable heights, for example).
 *
 * @see http://echo.nextapp.com/site/node/5287
 */
Contrib.TextPane = Core.extend(Echo.Component, {

    $load: function () {
        Echo.ComponentFactory.registerType("Contrib.TextPane", this);
    },

    componentType: "Contrib.TextPane",
    focusable: true,
    pane: true,

    /**
     * Programatically performs a text component action.
     */
    doAction: function () {
        this.fireEvent({
            type: "action",
            source: this,
            actionCommand: this.get("actionCommand")
        });
    }
});

/**
 * Component rendering peer: TextComponent
 */
Contrib.TextPane.Sync = Core.extend(Echo.Render.ComponentSync, {

    $static: {
        _supportedPartialProperties: ["text"]
    },

    $load: function () {
        Echo.Render.registerPeer("Contrib.TextPane", this);
    },

    _div: null,
    _textArea: null,

    _processBlur: function (e) {
        if (!this.client.verifyInput(this.component,
            Echo.Client.FLAG_INPUT_PROPERTY)) {
            return;
        }
        this.sanitizeInput();
        this.component.set("text", e.registeredTarget.value);
    },

    _processClick: function (e) {
        if (!this.client.verifyInput(this.component,
            Echo.Client.FLAG_INPUT_PROPERTY)) {
            return;
        }
        this.component.application.setFocusedComponent(this.component);
    },

    _processKeyPress: function (e) {
        if (!this.client.verifyInput(this.component,
            Echo.Client.FLAG_INPUT_PROPERTY)) {
            Core.Web.DOM.preventEventDefault(e);
            return true;
        }
    },

    _processKeyUp: function (e) {
        if (!this.client.verifyInput(this.component,
            Echo.Client.FLAG_INPUT_PROPERTY)) {
            Core.Web.DOM.preventEventDefault(e);
            return true;
        }
        this.sanitizeInput();

        // Store last updated text in local value, to ensure that we do not
        // attempt to
        // reset it to this value in renderUpdate() and miss any characters that
        // were
        // typed between repaints.
        this._text = e.registeredTarget.value;

        this.component.set("text", this._text);
        if (e.keyCode == 13) {
            this.component.doAction();
        }
        return true;
    },

    renderAdd: function (update, parentElement) {
        this._div = document.createElement("div");
        this._div.id = this.component.renderId;
        this._div.style.cssText = "position:absolute;top:0;left:0;bottom:0;right:0;overflow:hidden;";

        this._textArea = document.createElement("textarea");
        this._textArea.style.cssText = "margin:0;padding:0;border:0px none;width:100%;";
        this._div.appendChild(this._textArea);

        this._textArea.style.overflow = "auto";

        if (this.component.get("text")) {
            this._text = this._textArea.value = this.component.get("text");
        }

        var border = this.component.render("border");
        this._borderSizeVertical = Echo.Sync.Border.getPixelSize(border);

        if (this.component.isRenderEnabled()) {
            Echo.Sync.Border.render(border, this._div);
            Echo.Sync.Color.renderFB(this.component, this._textArea);
            Echo.Sync.Font
                .render(this.component.render("font"), this._textArea);
            Echo.Sync.FillImage.render(
                this.component.render("backgroundImage"), this._textArea);
        } else {
            Echo.Sync.Border.render(Echo.Sync.getEffectProperty(this.component,
                "border", "disabledBorder", true), this._div);
            Echo.Sync.Color.render(Echo.Sync.getEffectProperty(this.component,
                "foreground", "disabledForeground", true),
                this._textArea, "color");
            Echo.Sync.Color.render(Echo.Sync.getEffectProperty(this.component,
                "background", "disabledBackground", true),
                this._textArea, "backgroundColor");
            Echo.Sync.Font.render(Echo.Sync.getEffectProperty(this.component,
                "font", "disabledFont", true), this._textArea);
            Echo.Sync.FillImage.render(Echo.Sync.getEffectProperty(
                this.component, "backgroundImage",
                "disabledBackgroundImage", true), this._textArea);
        }

        Core.Web.Event.add(this._textArea, "click", Core.method(this,
            this._processClick), false);
        Core.Web.Event.add(this._textArea, "blur", Core.method(this,
            this._processBlur), false);
        Core.Web.Event.add(this._textArea, "keypress", Core.method(this,
            this._processKeyPress), false);
        Core.Web.Event.add(this._textArea, "keyup", Core.method(this,
            this._processKeyUp), false);

        parentElement.appendChild(this._div);
    },

    renderDisplay: function () {
        Core.Web.VirtualPosition.redraw(this._div);
        var height = this._div.parentNode.offsetHeight
            - this._borderSizeVertical;
        if (height > 0) {
            this._textArea.style.height = height + "px";
        }
    },

    renderDispose: function (update) {
        Core.Web.Event.removeAll(this._textArea);
        this._textArea = null;
        this._div = null;
    },

    renderFocus: function () {
        Core.Web.DOM.focusElement(this._textArea);
    },

    renderUpdate: function (update) {
        var fullRender = !Core.Arrays.containsAll(
            Echo.Sync.TextComponent._supportedPartialProperties, update
                .getUpdatedPropertyNames(), true);

        if (fullRender) {
            var element = this._textArea;
            var containerElement = element.parentNode;
            this.renderDispose(update);
            containerElement.removeChild(element);
            this.renderAdd(update, containerElement);
        } else {
            if (update.hasUpdatedProperties()) {
                var textUpdate = update.getUpdatedProperty("text");
                if (textUpdate && textUpdate.newValue != this._text) {
                    this._textArea.value = textUpdate.newValue === null
                        ? ""
                        : textUpdate.newValue;
                }
            }
        }

        // Store text in local value.
        this._text = this.component.get("text");

        return false; // Child elements not supported: safe to return false.
    },

    sanitizeInput: function () {
        var maximumLength = this.component.render("maximumLength", -1);
        if (maximumLength >= 0) {
            if (this._textArea.value
                && this._textArea.value.length > maximumLength) {
                this._textArea.value = this._textArea.value.substring(0,
                    maximumLength);
            }
        }
    }
});
/*
    http://www.JSON.org/json2.js
    2010-08-25

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, strict: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (!this.JSON) {
    this.JSON = {};
}

(function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
.replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
/*!
 * jQuery JavaScript Library v1.3.2
 * http://jquery.com/
 *
 * Copyright (c) 2009 John Resig
 * Dual licensed under the MIT and GPL licenses.
 * http://docs.jquery.com/License
 *
 * Date: 2009-02-19 17:34:21 -0500 (Thu, 19 Feb 2009)
 * Revision: 6246
 */
(function(){

var 
	// Will speed up references to window, and allows munging its name.
	window = this,
	// Will speed up references to undefined, and allows munging its name.
	undefined,
	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,
	// Map over the $ in case of overwrite
	_$ = window.$,

	jQuery = window.jQuery = window.$ = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		return new jQuery.fn.init( selector, context );
	},

	// A simple way to check for HTML strings or ID strings
	// (both of which we optimize for)
	quickExpr = /^[^<]*(<(.|\s)+>)[^>]*$|^#([\w-]+)$/,
	// Is it a simple selector
	isSimple = /^.[^:#\[\.,]*$/;

jQuery.fn = jQuery.prototype = {
	init: function( selector, context ) {
		// Make sure that a selection was provided
		selector = selector || document;

		// Handle $(DOMElement)
		if ( selector.nodeType ) {
			this[0] = selector;
			this.length = 1;
			this.context = selector;
			return this;
		}
		// Handle HTML strings
		if ( typeof selector === "string" ) {
			// Are we dealing with HTML string or an ID?
			var match = quickExpr.exec( selector );

			// Verify a match, and that no context was specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] )
					selector = jQuery.clean( [ match[1] ], context );

				// HANDLE: $("#id")
				else {
					var elem = document.getElementById( match[3] );

					// Handle the case where IE and Opera return items
					// by name instead of ID
					if ( elem && elem.id != match[3] )
						return jQuery().find( selector );

					// Otherwise, we inject the element directly into the jQuery object
					var ret = jQuery( elem || [] );
					ret.context = document;
					ret.selector = selector;
					return ret;
				}

			// HANDLE: $(expr, [context])
			// (which is just equivalent to: $(content).find(expr)
			} else
				return jQuery( context ).find( selector );

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) )
			return jQuery( document ).ready( selector );

		// Make sure that old selector state is passed along
		if ( selector.selector && selector.context ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return this.setArray(jQuery.isArray( selector ) ?
			selector :
			jQuery.makeArray(selector));
	},

	// Start with an empty selector
	selector: "",

	// The current version of jQuery being used
	jquery: "1.3.2",

	// The number of elements contained in the matched element set
	size: function() {
		return this.length;
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num === undefined ?

			// Return a 'clean' array
			Array.prototype.slice.call( this ) :

			// Return just the object
			this[ num ];
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems, name, selector ) {
		// Build a new jQuery matched element set
		var ret = jQuery( elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		ret.context = this.context;

		if ( name === "find" )
			ret.selector = this.selector + (this.selector ? " " : "") + selector;
		else if ( name )
			ret.selector = this.selector + "." + name + "(" + selector + ")";

		// Return the newly-formed element set
		return ret;
	},

	// Force the current matched set of elements to become
	// the specified array of elements (destroying the stack in the process)
	// You should use pushStack() in order to do this, but maintain the stack
	setArray: function( elems ) {
		// Resetting the length to 0, then using the native Array push
		// is a super-fast way to populate an object with array-like properties
		this.length = 0;
		Array.prototype.push.apply( this, elems );

		return this;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {
		// Locate the position of the desired element
		return jQuery.inArray(
			// If it receives a jQuery object, the first element is used
			elem && elem.jquery ? elem[0] : elem
		, this );
	},

	attr: function( name, value, type ) {
		var options = name;

		// Look for the case where we're accessing a style value
		if ( typeof name === "string" )
			if ( value === undefined )
				return this[0] && jQuery[ type || "attr" ]( this[0], name );

			else {
				options = {};
				options[ name ] = value;
			}

		// Check to see if we're setting style values
		return this.each(function(i){
			// Set all the styles
			for ( name in options )
				jQuery.attr(
					type ?
						this.style :
						this,
					name, jQuery.prop( this, options[ name ], type, i, name )
				);
		});
	},

	css: function( key, value ) {
		// ignore negative width and height values
		if ( (key == 'width' || key == 'height') && parseFloat(value) < 0 )
			value = undefined;
		return this.attr( key, value, "curCSS" );
	},

	text: function( text ) {
		if ( typeof text !== "object" && text != null )
			return this.empty().append( (this[0] && this[0].ownerDocument || document).createTextNode( text ) );

		var ret = "";

		jQuery.each( text || this, function(){
			jQuery.each( this.childNodes, function(){
				if ( this.nodeType != 8 )
					ret += this.nodeType != 1 ?
						this.nodeValue :
						jQuery.fn.text( [ this ] );
			});
		});

		return ret;
	},

	wrapAll: function( html ) {
		if ( this[0] ) {
			// The elements to wrap the target around
			var wrap = jQuery( html, this[0].ownerDocument ).clone();

			if ( this[0].parentNode )
				wrap.insertBefore( this[0] );

			wrap.map(function(){
				var elem = this;

				while ( elem.firstChild )
					elem = elem.firstChild;

				return elem;
			}).append(this);
		}

		return this;
	},

	wrapInner: function( html ) {
		return this.each(function(){
			jQuery( this ).contents().wrapAll( html );
		});
	},

	wrap: function( html ) {
		return this.each(function(){
			jQuery( this ).wrapAll( html );
		});
	},

	append: function() {
		return this.domManip(arguments, true, function(elem){
			if (this.nodeType == 1)
				this.appendChild( elem );
		});
	},

	prepend: function() {
		return this.domManip(arguments, true, function(elem){
			if (this.nodeType == 1)
				this.insertBefore( elem, this.firstChild );
		});
	},

	before: function() {
		return this.domManip(arguments, false, function(elem){
			this.parentNode.insertBefore( elem, this );
		});
	},

	after: function() {
		return this.domManip(arguments, false, function(elem){
			this.parentNode.insertBefore( elem, this.nextSibling );
		});
	},

	end: function() {
		return this.prevObject || jQuery( [] );
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: [].push,
	sort: [].sort,
	splice: [].splice,

	find: function( selector ) {
		if ( this.length === 1 ) {
			var ret = this.pushStack( [], "find", selector );
			ret.length = 0;
			jQuery.find( selector, this[0], ret );
			return ret;
		} else {
			return this.pushStack( jQuery.unique(jQuery.map(this, function(elem){
				return jQuery.find( selector, elem );
			})), "find", selector );
		}
	},

	clone: function( events ) {
		// Do the clone
		var ret = this.map(function(){
			if ( !jQuery.support.noCloneEvent && !jQuery.isXMLDoc(this) ) {
				// IE copies events bound via attachEvent when
				// using cloneNode. Calling detachEvent on the
				// clone will also remove the events from the orignal
				// In order to get around this, we use innerHTML.
				// Unfortunately, this means some modifications to
				// attributes in IE that are actually only stored
				// as properties will not be copied (such as the
				// the name attribute on an input).
				var html = this.outerHTML;
				if ( !html ) {
					var div = this.ownerDocument.createElement("div");
					div.appendChild( this.cloneNode(true) );
					html = div.innerHTML;
				}

				return jQuery.clean([html.replace(/ jQuery\d+="(?:\d+|null)"/g, "").replace(/^\s*/, "")])[0];
			} else
				return this.cloneNode(true);
		});

		// Copy the events from the original to the clone
		if ( events === true ) {
			var orig = this.find("*").andSelf(), i = 0;

			ret.find("*").andSelf().each(function(){
				if ( this.nodeName !== orig[i].nodeName )
					return;

				var events = jQuery.data( orig[i], "events" );

				for ( var type in events ) {
					for ( var handler in events[ type ] ) {
						jQuery.event.add( this, type, events[ type ][ handler ], events[ type ][ handler ].data );
					}
				}

				i++;
			});
		}

		// Return the cloned set
		return ret;
	},

	filter: function( selector ) {
		return this.pushStack(
			jQuery.isFunction( selector ) &&
			jQuery.grep(this, function(elem, i){
				return selector.call( elem, i );
			}) ||

			jQuery.multiFilter( selector, jQuery.grep(this, function(elem){
				return elem.nodeType === 1;
			}) ), "filter", selector );
	},

	closest: function( selector ) {
		var pos = jQuery.expr.match.POS.test( selector ) ? jQuery(selector) : null,
			closer = 0;

		return this.map(function(){
			var cur = this;
			while ( cur && cur.ownerDocument ) {
				if ( pos ? pos.index(cur) > -1 : jQuery(cur).is(selector) ) {
					jQuery.data(cur, "closest", closer);
					return cur;
				}
				cur = cur.parentNode;
				closer++;
			}
		});
	},

	not: function( selector ) {
		if ( typeof selector === "string" )
			// test special case where just one selector is passed in
			if ( isSimple.test( selector ) )
				return this.pushStack( jQuery.multiFilter( selector, this, true ), "not", selector );
			else
				selector = jQuery.multiFilter( selector, this );

		var isArrayLike = selector.length && selector[selector.length - 1] !== undefined && !selector.nodeType;
		return this.filter(function() {
			return isArrayLike ? jQuery.inArray( this, selector ) < 0 : this != selector;
		});
	},

	add: function( selector ) {
		return this.pushStack( jQuery.unique( jQuery.merge(
			this.get(),
			typeof selector === "string" ?
				jQuery( selector ) :
				jQuery.makeArray( selector )
		)));
	},

	is: function( selector ) {
		return !!selector && jQuery.multiFilter( selector, this ).length > 0;
	},

	hasClass: function( selector ) {
		return !!selector && this.is( "." + selector );
	},

	val: function( value ) {
		if ( value === undefined ) {			
			var elem = this[0];

			if ( elem ) {
				if( jQuery.nodeName( elem, 'option' ) )
					return (elem.attributes.value || {}).specified ? elem.value : elem.text;
				
				// We need to handle select boxes special
				if ( jQuery.nodeName( elem, "select" ) ) {
					var index = elem.selectedIndex,
						values = [],
						options = elem.options,
						one = elem.type == "select-one";

					// Nothing was selected
					if ( index < 0 )
						return null;

					// Loop through all the selected options
					for ( var i = one ? index : 0, max = one ? index + 1 : options.length; i < max; i++ ) {
						var option = options[ i ];

						if ( option.selected ) {
							// Get the specifc value for the option
							value = jQuery(option).val();

							// We don't need an array for one selects
							if ( one )
								return value;

							// Multi-Selects return an array
							values.push( value );
						}
					}

					return values;				
				}

				// Everything else, we just grab the value
				return (elem.value || "").replace(/\r/g, "");

			}

			return undefined;
		}

		if ( typeof value === "number" )
			value += '';

		return this.each(function(){
			if ( this.nodeType != 1 )
				return;

			if ( jQuery.isArray(value) && /radio|checkbox/.test( this.type ) )
				this.checked = (jQuery.inArray(this.value, value) >= 0 ||
					jQuery.inArray(this.name, value) >= 0);

			else if ( jQuery.nodeName( this, "select" ) ) {
				var values = jQuery.makeArray(value);

				jQuery( "option", this ).each(function(){
					this.selected = (jQuery.inArray( this.value, values ) >= 0 ||
						jQuery.inArray( this.text, values ) >= 0);
				});

				if ( !values.length )
					this.selectedIndex = -1;

			} else
				this.value = value;
		});
	},

	html: function( value ) {
		return value === undefined ?
			(this[0] ?
				this[0].innerHTML.replace(/ jQuery\d+="(?:\d+|null)"/g, "") :
				null) :
			this.empty().append( value );
	},

	replaceWith: function( value ) {
		return this.after( value ).remove();
	},

	eq: function( i ) {
		return this.slice( i, +i + 1 );
	},

	slice: function() {
		return this.pushStack( Array.prototype.slice.apply( this, arguments ),
			"slice", Array.prototype.slice.call(arguments).join(",") );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function(elem, i){
			return callback.call( elem, i, elem );
		}));
	},

	andSelf: function() {
		return this.add( this.prevObject );
	},

	domManip: function( args, table, callback ) {
		if ( this[0] ) {
			var fragment = (this[0].ownerDocument || this[0]).createDocumentFragment(),
				scripts = jQuery.clean( args, (this[0].ownerDocument || this[0]), fragment ),
				first = fragment.firstChild;

			if ( first )
				for ( var i = 0, l = this.length; i < l; i++ )
					callback.call( root(this[i], first), this.length > 1 || i > 0 ?
							fragment.cloneNode(true) : fragment );
		
			if ( scripts )
				jQuery.each( scripts, evalScript );
		}

		return this;
		
		function root( elem, cur ) {
			return table && jQuery.nodeName(elem, "table") && jQuery.nodeName(cur, "tr") ?
				(elem.getElementsByTagName("tbody")[0] ||
				elem.appendChild(elem.ownerDocument.createElement("tbody"))) :
				elem;
		}
	}
};

// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;

function evalScript( i, elem ) {
	if ( elem.src )
		jQuery.ajax({
			url: elem.src,
			async: false,
			dataType: "script"
		});

	else
		jQuery.globalEval( elem.text || elem.textContent || elem.innerHTML || "" );

	if ( elem.parentNode )
		elem.parentNode.removeChild( elem );
}

function now(){
	return +new Date;
}

jQuery.extend = jQuery.fn.extend = function() {
	// copy reference to target object
	var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false, options;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) )
		target = {};

	// extend jQuery itself if only one argument is passed
	if ( length == i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ )
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null )
			// Extend the base object
			for ( var name in options ) {
				var src = target[ name ], copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy )
					continue;

				// Recurse if we're merging object values
				if ( deep && copy && typeof copy === "object" && !copy.nodeType )
					target[ name ] = jQuery.extend( deep, 
						// Never move original objects, clone them
						src || ( copy.length != null ? [ ] : { } )
					, copy );

				// Don't bring in undefined values
				else if ( copy !== undefined )
					target[ name ] = copy;

			}

	// Return the modified object
	return target;
};

// exclude the following css properties to add px
var	exclude = /z-?index|font-?weight|opacity|zoom|line-?height/i,
	// cache defaultView
	defaultView = document.defaultView || {},
	toString = Object.prototype.toString;

jQuery.extend({
	noConflict: function( deep ) {
		window.$ = _$;

		if ( deep )
			window.jQuery = _jQuery;

		return jQuery;
	},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return toString.call(obj) === "[object Function]";
	},

	isArray: function( obj ) {
		return toString.call(obj) === "[object Array]";
	},

	// check if an element is in a (or is an) XML document
	isXMLDoc: function( elem ) {
		return elem.nodeType === 9 && elem.documentElement.nodeName !== "HTML" ||
			!!elem.ownerDocument && jQuery.isXMLDoc( elem.ownerDocument );
	},

	// Evalulates a script in a global context
	globalEval: function( data ) {
		if ( data && /\S/.test(data) ) {
			// Inspired by code by Andrea Giammarchi
			// http://webreflection.blogspot.com/2007/08/global-scope-evaluation-and-dom.html
			var head = document.getElementsByTagName("head")[0] || document.documentElement,
				script = document.createElement("script");

			script.type = "text/javascript";
			if ( jQuery.support.scriptEval )
				script.appendChild( document.createTextNode( data ) );
			else
				script.text = data;

			// Use insertBefore instead of appendChild  to circumvent an IE6 bug.
			// This arises when a base node is used (#2709).
			head.insertBefore( script, head.firstChild );
			head.removeChild( script );
		}
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toUpperCase() == name.toUpperCase();
	},

	// args is for internal usage only
	each: function( object, callback, args ) {
		var name, i = 0, length = object.length;

		if ( args ) {
			if ( length === undefined ) {
				for ( name in object )
					if ( callback.apply( object[ name ], args ) === false )
						break;
			} else
				for ( ; i < length; )
					if ( callback.apply( object[ i++ ], args ) === false )
						break;

		// A special, fast, case for the most common use of each
		} else {
			if ( length === undefined ) {
				for ( name in object )
					if ( callback.call( object[ name ], name, object[ name ] ) === false )
						break;
			} else
				for ( var value = object[0];
					i < length && callback.call( value, i, value ) !== false; value = object[++i] ){}
		}

		return object;
	},

	prop: function( elem, value, type, i, name ) {
		// Handle executable functions
		if ( jQuery.isFunction( value ) )
			value = value.call( elem, i );

		// Handle passing in a number to a CSS property
		return typeof value === "number" && type == "curCSS" && !exclude.test( name ) ?
			value + "px" :
			value;
	},

	className: {
		// internal only, use addClass("class")
		add: function( elem, classNames ) {
			jQuery.each((classNames || "").split(/\s+/), function(i, className){
				if ( elem.nodeType == 1 && !jQuery.className.has( elem.className, className ) )
					elem.className += (elem.className ? " " : "") + className;
			});
		},

		// internal only, use removeClass("class")
		remove: function( elem, classNames ) {
			if (elem.nodeType == 1)
				elem.className = classNames !== undefined ?
					jQuery.grep(elem.className.split(/\s+/), function(className){
						return !jQuery.className.has( classNames, className );
					}).join(" ") :
					"";
		},

		// internal only, use hasClass("class")
		has: function( elem, className ) {
			return elem && jQuery.inArray( className, (elem.className || elem).toString().split(/\s+/) ) > -1;
		}
	},

	// A method for quickly swapping in/out CSS properties to get correct calculations
	swap: function( elem, options, callback ) {
		var old = {};
		// Remember the old values, and insert the new ones
		for ( var name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		callback.call( elem );

		// Revert the old values
		for ( var name in options )
			elem.style[ name ] = old[ name ];
	},

	css: function( elem, name, force, extra ) {
		if ( name == "width" || name == "height" ) {
			var val, props = { position: "absolute", visibility: "hidden", display:"block" }, which = name == "width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ];

			function getWH() {
				val = name == "width" ? elem.offsetWidth : elem.offsetHeight;

				if ( extra === "border" )
					return;

				jQuery.each( which, function() {
					if ( !extra )
						val -= parseFloat(jQuery.curCSS( elem, "padding" + this, true)) || 0;
					if ( extra === "margin" )
						val += parseFloat(jQuery.curCSS( elem, "margin" + this, true)) || 0;
					else
						val -= parseFloat(jQuery.curCSS( elem, "border" + this + "Width", true)) || 0;
				});
			}

			if ( elem.offsetWidth !== 0 )
				getWH();
			else
				jQuery.swap( elem, props, getWH );

			return Math.max(0, Math.round(val));
		}

		return jQuery.curCSS( elem, name, force );
	},

	curCSS: function( elem, name, force ) {
		var ret, style = elem.style;

		// We need to handle opacity special in IE
		if ( name == "opacity" && !jQuery.support.opacity ) {
			ret = jQuery.attr( style, "opacity" );

			return ret == "" ?
				"1" :
				ret;
		}

		// Make sure we're using the right name for getting the float value
		if ( name.match( /float/i ) )
			name = styleFloat;

		if ( !force && style && style[ name ] )
			ret = style[ name ];

		else if ( defaultView.getComputedStyle ) {

			// Only "float" is needed here
			if ( name.match( /float/i ) )
				name = "float";

			name = name.replace( /([A-Z])/g, "-$1" ).toLowerCase();

			var computedStyle = defaultView.getComputedStyle( elem, null );

			if ( computedStyle )
				ret = computedStyle.getPropertyValue( name );

			// We should always get a number back from opacity
			if ( name == "opacity" && ret == "" )
				ret = "1";

		} else if ( elem.currentStyle ) {
			var camelCase = name.replace(/\-(\w)/g, function(all, letter){
				return letter.toUpperCase();
			});

			ret = elem.currentStyle[ name ] || elem.currentStyle[ camelCase ];

			// From the awesome hack by Dean Edwards
			// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

			// If we're not dealing with a regular pixel number
			// but a number that has a weird ending, we need to convert it to pixels
			if ( !/^\d+(px)?$/i.test( ret ) && /^\d/.test( ret ) ) {
				// Remember the original values
				var left = style.left, rsLeft = elem.runtimeStyle.left;

				// Put in the new values to get a computed value out
				elem.runtimeStyle.left = elem.currentStyle.left;
				style.left = ret || 0;
				ret = style.pixelLeft + "px";

				// Revert the changed values
				style.left = left;
				elem.runtimeStyle.left = rsLeft;
			}
		}

		return ret;
	},

	clean: function( elems, context, fragment ) {
		context = context || document;

		// !context.createElement fails in IE with an error but returns typeof 'object'
		if ( typeof context.createElement === "undefined" )
			context = context.ownerDocument || context[0] && context[0].ownerDocument || document;

		// If a single string is passed in and it's a single tag
		// just do a createElement and skip the rest
		if ( !fragment && elems.length === 1 && typeof elems[0] === "string" ) {
			var match = /^<(\w+)\s*\/?>$/.exec(elems[0]);
			if ( match )
				return [ context.createElement( match[1] ) ];
		}

		var ret = [], scripts = [], div = context.createElement("div");

		jQuery.each(elems, function(i, elem){
			if ( typeof elem === "number" )
				elem += '';

			if ( !elem )
				return;

			// Convert html string into DOM nodes
			if ( typeof elem === "string" ) {
				// Fix "XHTML"-style tags in all browsers
				elem = elem.replace(/(<(\w+)[^>]*?)\/>/g, function(all, front, tag){
					return tag.match(/^(abbr|br|col|img|input|link|meta|param|hr|area|embed)$/i) ?
						all :
						front + "></" + tag + ">";
				});

				// Trim whitespace, otherwise indexOf won't work as expected
				var tags = elem.replace(/^\s+/, "").substring(0, 10).toLowerCase();

				var wrap =
					// option or optgroup
					!tags.indexOf("<opt") &&
					[ 1, "<select multiple='multiple'>", "</select>" ] ||

					!tags.indexOf("<leg") &&
					[ 1, "<fieldset>", "</fieldset>" ] ||

					tags.match(/^<(thead|tbody|tfoot|colg|cap)/) &&
					[ 1, "<table>", "</table>" ] ||

					!tags.indexOf("<tr") &&
					[ 2, "<table><tbody>", "</tbody></table>" ] ||

				 	// <thead> matched above
					(!tags.indexOf("<td") || !tags.indexOf("<th")) &&
					[ 3, "<table><tbody><tr>", "</tr></tbody></table>" ] ||

					!tags.indexOf("<col") &&
					[ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ] ||

					// IE can't serialize <link> and <script> tags normally
					!jQuery.support.htmlSerialize &&
					[ 1, "div<div>", "</div>" ] ||

					[ 0, "", "" ];

				// Go to html and back, then peel off extra wrappers
				div.innerHTML = wrap[1] + elem + wrap[2];

				// Move to the right depth
				while ( wrap[0]-- )
					div = div.lastChild;

				// Remove IE's autoinserted <tbody> from table fragments
				if ( !jQuery.support.tbody ) {

					// String was a <table>, *may* have spurious <tbody>
					var hasBody = /<tbody/i.test(elem),
						tbody = !tags.indexOf("<table") && !hasBody ?
							div.firstChild && div.firstChild.childNodes :

						// String was a bare <thead> or <tfoot>
						wrap[1] == "<table>" && !hasBody ?
							div.childNodes :
							[];

					for ( var j = tbody.length - 1; j >= 0 ; --j )
						if ( jQuery.nodeName( tbody[ j ], "tbody" ) && !tbody[ j ].childNodes.length )
							tbody[ j ].parentNode.removeChild( tbody[ j ] );

					}

				// IE completely kills leading whitespace when innerHTML is used
				if ( !jQuery.support.leadingWhitespace && /^\s/.test( elem ) )
					div.insertBefore( context.createTextNode( elem.match(/^\s*/)[0] ), div.firstChild );
				
				elem = jQuery.makeArray( div.childNodes );
			}

			if ( elem.nodeType )
				ret.push( elem );
			else
				ret = jQuery.merge( ret, elem );

		});

		if ( fragment ) {
			for ( var i = 0; ret[i]; i++ ) {
				if ( jQuery.nodeName( ret[i], "script" ) && (!ret[i].type || ret[i].type.toLowerCase() === "text/javascript") ) {
					scripts.push( ret[i].parentNode ? ret[i].parentNode.removeChild( ret[i] ) : ret[i] );
				} else {
					if ( ret[i].nodeType === 1 )
						ret.splice.apply( ret, [i + 1, 0].concat(jQuery.makeArray(ret[i].getElementsByTagName("script"))) );
					fragment.appendChild( ret[i] );
				}
			}
			
			return scripts;
		}

		return ret;
	},

	attr: function( elem, name, value ) {
		// don't set attributes on text and comment nodes
		if (!elem || elem.nodeType == 3 || elem.nodeType == 8)
			return undefined;

		var notxml = !jQuery.isXMLDoc( elem ),
			// Whether we are setting (or getting)
			set = value !== undefined;

		// Try to normalize/fix the name
		name = notxml && jQuery.props[ name ] || name;

		// Only do all the following if this is a node (faster for style)
		// IE elem.getAttribute passes even for style
		if ( elem.tagName ) {

			// These attributes require special treatment
			var special = /href|src|style/.test( name );

			// Safari mis-reports the default selected property of a hidden option
			// Accessing the parent's selectedIndex property fixes it
			if ( name == "selected" && elem.parentNode )
				elem.parentNode.selectedIndex;

			// If applicable, access the attribute via the DOM 0 way
			if ( name in elem && notxml && !special ) {
				if ( set ){
					// We can't allow the type property to be changed (since it causes problems in IE)
					if ( name == "type" && jQuery.nodeName( elem, "input" ) && elem.parentNode )
						throw "type property can't be changed";

					elem[ name ] = value;
				}

				// browsers index elements by id/name on forms, give priority to attributes.
				if( jQuery.nodeName( elem, "form" ) && elem.getAttributeNode(name) )
					return elem.getAttributeNode( name ).nodeValue;

				// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				if ( name == "tabIndex" ) {
					var attributeNode = elem.getAttributeNode( "tabIndex" );
					return attributeNode && attributeNode.specified
						? attributeNode.value
						: elem.nodeName.match(/(button|input|object|select|textarea)/i)
							? 0
							: elem.nodeName.match(/^(a|area)$/i) && elem.href
								? 0
								: undefined;
				}

				return elem[ name ];
			}

			if ( !jQuery.support.style && notxml &&  name == "style" )
				return jQuery.attr( elem.style, "cssText", value );

			if ( set )
				// convert the value to a string (all browsers do this but IE) see #1070
				elem.setAttribute( name, "" + value );

			var attr = !jQuery.support.hrefNormalized && notxml && special
					// Some attributes require a special call on IE
					? elem.getAttribute( name, 2 )
					: elem.getAttribute( name );

			// Non-existent attributes return null, we normalize to undefined
			return attr === null ? undefined : attr;
		}

		// elem is actually elem.style ... set the style

		// IE uses filters for opacity
		if ( !jQuery.support.opacity && name == "opacity" ) {
			if ( set ) {
				// IE has trouble with opacity if it does not have layout
				// Force it by setting the zoom level
				elem.zoom = 1;

				// Set the alpha filter to set the opacity
				elem.filter = (elem.filter || "").replace( /alpha\([^)]*\)/, "" ) +
					(parseInt( value ) + '' == "NaN" ? "" : "alpha(opacity=" + value * 100 + ")");
			}

			return elem.filter && elem.filter.indexOf("opacity=") >= 0 ?
				(parseFloat( elem.filter.match(/opacity=([^)]*)/)[1] ) / 100) + '':
				"";
		}

		name = name.replace(/-([a-z])/ig, function(all, letter){
			return letter.toUpperCase();
		});

		if ( set )
			elem[ name ] = value;

		return elem[ name ];
	},

	trim: function( text ) {
		return (text || "").replace( /^\s+|\s+$/g, "" );
	},

	makeArray: function( array ) {
		var ret = [];

		if( array != null ){
			var i = array.length;
			// The window, strings (and functions) also have 'length'
			if( i == null || typeof array === "string" || jQuery.isFunction(array) || array.setInterval )
				ret[0] = array;
			else
				while( i )
					ret[--i] = array[i];
		}

		return ret;
	},

	inArray: function( elem, array ) {
		for ( var i = 0, length = array.length; i < length; i++ )
		// Use === because on IE, window == document
			if ( array[ i ] === elem )
				return i;

		return -1;
	},

	merge: function( first, second ) {
		// We have to loop this way because IE & Opera overwrite the length
		// expando of getElementsByTagName
		var i = 0, elem, pos = first.length;
		// Also, we need to make sure that the correct elements are being returned
		// (IE returns comment nodes in a '*' query)
		if ( !jQuery.support.getAll ) {
			while ( (elem = second[ i++ ]) != null )
				if ( elem.nodeType != 8 )
					first[ pos++ ] = elem;

		} else
			while ( (elem = second[ i++ ]) != null )
				first[ pos++ ] = elem;

		return first;
	},

	unique: function( array ) {
		var ret = [], done = {};

		try {

			for ( var i = 0, length = array.length; i < length; i++ ) {
				var id = jQuery.data( array[ i ] );

				if ( !done[ id ] ) {
					done[ id ] = true;
					ret.push( array[ i ] );
				}
			}

		} catch( e ) {
			ret = array;
		}

		return ret;
	},

	grep: function( elems, callback, inv ) {
		var ret = [];

		// Go through the array, only saving the items
		// that pass the validator function
		for ( var i = 0, length = elems.length; i < length; i++ )
			if ( !inv != !callback( elems[ i ], i ) )
				ret.push( elems[ i ] );

		return ret;
	},

	map: function( elems, callback ) {
		var ret = [];

		// Go through the array, translating each of the items to their
		// new value (or values).
		for ( var i = 0, length = elems.length; i < length; i++ ) {
			var value = callback( elems[ i ], i );

			if ( value != null )
				ret[ ret.length ] = value;
		}

		return ret.concat.apply( [], ret );
	}
});

// Use of jQuery.browser is deprecated.
// It's included for backwards compatibility and plugins,
// although they should work to migrate away.

var userAgent = navigator.userAgent.toLowerCase();

// Figure out what browser is being used
jQuery.browser = {
	version: (userAgent.match( /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [0,'0'])[1],
	safari: /webkit/.test( userAgent ),
	opera: /opera/.test( userAgent ),
	msie: /msie/.test( userAgent ) && !/opera/.test( userAgent ),
	mozilla: /mozilla/.test( userAgent ) && !/(compatible|webkit)/.test( userAgent )
};

jQuery.each({
	parent: function(elem){return elem.parentNode;},
	parents: function(elem){return jQuery.dir(elem,"parentNode");},
	next: function(elem){return jQuery.nth(elem,2,"nextSibling");},
	prev: function(elem){return jQuery.nth(elem,2,"previousSibling");},
	nextAll: function(elem){return jQuery.dir(elem,"nextSibling");},
	prevAll: function(elem){return jQuery.dir(elem,"previousSibling");},
	siblings: function(elem){return jQuery.sibling(elem.parentNode.firstChild,elem);},
	children: function(elem){return jQuery.sibling(elem.firstChild);},
	contents: function(elem){return jQuery.nodeName(elem,"iframe")?elem.contentDocument||elem.contentWindow.document:jQuery.makeArray(elem.childNodes);}
}, function(name, fn){
	jQuery.fn[ name ] = function( selector ) {
		var ret = jQuery.map( this, fn );

		if ( selector && typeof selector == "string" )
			ret = jQuery.multiFilter( selector, ret );

		return this.pushStack( jQuery.unique( ret ), name, selector );
	};
});

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function(name, original){
	jQuery.fn[ name ] = function( selector ) {
		var ret = [], insert = jQuery( selector );

		for ( var i = 0, l = insert.length; i < l; i++ ) {
			var elems = (i > 0 ? this.clone(true) : this).get();
			jQuery.fn[ original ].apply( jQuery(insert[i]), elems );
			ret = ret.concat( elems );
		}

		return this.pushStack( ret, name, selector );
	};
});

jQuery.each({
	removeAttr: function( name ) {
		jQuery.attr( this, name, "" );
		if (this.nodeType == 1)
			this.removeAttribute( name );
	},

	addClass: function( classNames ) {
		jQuery.className.add( this, classNames );
	},

	removeClass: function( classNames ) {
		jQuery.className.remove( this, classNames );
	},

	toggleClass: function( classNames, state ) {
		if( typeof state !== "boolean" )
			state = !jQuery.className.has( this, classNames );
		jQuery.className[ state ? "add" : "remove" ]( this, classNames );
	},

	remove: function( selector ) {
		if ( !selector || jQuery.filter( selector, [ this ] ).length ) {
			// Prevent memory leaks
			jQuery( "*", this ).add([this]).each(function(){
				jQuery.event.remove(this);
				jQuery.removeData(this);
			});
			if (this.parentNode)
				this.parentNode.removeChild( this );
		}
	},

	empty: function() {
		// Remove element nodes and prevent memory leaks
		jQuery(this).children().remove();

		// Remove any remaining nodes
		while ( this.firstChild )
			this.removeChild( this.firstChild );
	}
}, function(name, fn){
	jQuery.fn[ name ] = function(){
		return this.each( fn, arguments );
	};
});

// Helper function used by the dimensions and offset modules
function num(elem, prop) {
	return elem[0] && parseInt( jQuery.curCSS(elem[0], prop, true), 10 ) || 0;
}
var expando = "jQuery" + now(), uuid = 0, windowData = {};

jQuery.extend({
	cache: {},

	data: function( elem, name, data ) {
		elem = elem == window ?
			windowData :
			elem;

		var id = elem[ expando ];

		// Compute a unique ID for the element
		if ( !id )
			id = elem[ expando ] = ++uuid;

		// Only generate the data cache if we're
		// trying to access or manipulate it
		if ( name && !jQuery.cache[ id ] )
			jQuery.cache[ id ] = {};

		// Prevent overriding the named cache with undefined values
		if ( data !== undefined )
			jQuery.cache[ id ][ name ] = data;

		// Return the named cache data, or the ID for the element
		return name ?
			jQuery.cache[ id ][ name ] :
			id;
	},

	removeData: function( elem, name ) {
		elem = elem == window ?
			windowData :
			elem;

		var id = elem[ expando ];

		// If we want to remove a specific section of the element's data
		if ( name ) {
			if ( jQuery.cache[ id ] ) {
				// Remove the section of cache data
				delete jQuery.cache[ id ][ name ];

				// If we've removed all the data, remove the element's cache
				name = "";

				for ( name in jQuery.cache[ id ] )
					break;

				if ( !name )
					jQuery.removeData( elem );
			}

		// Otherwise, we want to remove all of the element's data
		} else {
			// Clean up the element expando
			try {
				delete elem[ expando ];
			} catch(e){
				// IE has trouble directly removing the expando
				// but it's ok with using removeAttribute
				if ( elem.removeAttribute )
					elem.removeAttribute( expando );
			}

			// Completely remove the data cache
			delete jQuery.cache[ id ];
		}
	},
	queue: function( elem, type, data ) {
		if ( elem ){
	
			type = (type || "fx") + "queue";
	
			var q = jQuery.data( elem, type );
	
			if ( !q || jQuery.isArray(data) )
				q = jQuery.data( elem, type, jQuery.makeArray(data) );
			else if( data )
				q.push( data );
	
		}
		return q;
	},

	dequeue: function( elem, type ){
		var queue = jQuery.queue( elem, type ),
			fn = queue.shift();
		
		if( !type || type === "fx" )
			fn = queue[0];
			
		if( fn !== undefined )
			fn.call(elem);
	}
});

jQuery.fn.extend({
	data: function( key, value ){
		var parts = key.split(".");
		parts[1] = parts[1] ? "." + parts[1] : "";

		if ( value === undefined ) {
			var data = this.triggerHandler("getData" + parts[1] + "!", [parts[0]]);

			if ( data === undefined && this.length )
				data = jQuery.data( this[0], key );

			return data === undefined && parts[1] ?
				this.data( parts[0] ) :
				data;
		} else
			return this.trigger("setData" + parts[1] + "!", [parts[0], value]).each(function(){
				jQuery.data( this, key, value );
			});
	},

	removeData: function( key ){
		return this.each(function(){
			jQuery.removeData( this, key );
		});
	},
	queue: function(type, data){
		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
		}

		if ( data === undefined )
			return jQuery.queue( this[0], type );

		return this.each(function(){
			var queue = jQuery.queue( this, type, data );
			
			 if( type == "fx" && queue.length == 1 )
				queue[0].call(this);
		});
	},
	dequeue: function(type){
		return this.each(function(){
			jQuery.dequeue( this, type );
		});
	}
});/*!
 * Sizzle CSS Selector Engine - v0.9.3
 *  Copyright 2009, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function(){

var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^[\]]*\]|['"][^'"]*['"]|[^[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?/g,
	done = 0,
	toString = Object.prototype.toString;

var Sizzle = function(selector, context, results, seed) {
	results = results || [];
	context = context || document;

	if ( context.nodeType !== 1 && context.nodeType !== 9 )
		return [];
	
	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	var parts = [], m, set, checkSet, check, mode, extra, prune = true;
	
	// Reset the position of the chunker regexp (start from head)
	chunker.lastIndex = 0;
	
	while ( (m = chunker.exec(selector)) !== null ) {
		parts.push( m[1] );
		
		if ( m[2] ) {
			extra = RegExp.rightContext;
			break;
		}
	}

	if ( parts.length > 1 && origPOS.exec( selector ) ) {
		if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
			set = posProcess( parts[0] + parts[1], context );
		} else {
			set = Expr.relative[ parts[0] ] ?
				[ context ] :
				Sizzle( parts.shift(), context );

			while ( parts.length ) {
				selector = parts.shift();

				if ( Expr.relative[ selector ] )
					selector += parts.shift();

				set = posProcess( selector, set );
			}
		}
	} else {
		var ret = seed ?
			{ expr: parts.pop(), set: makeArray(seed) } :
			Sizzle.find( parts.pop(), parts.length === 1 && context.parentNode ? context.parentNode : context, isXML(context) );
		set = Sizzle.filter( ret.expr, ret.set );

		if ( parts.length > 0 ) {
			checkSet = makeArray(set);
		} else {
			prune = false;
		}

		while ( parts.length ) {
			var cur = parts.pop(), pop = cur;

			if ( !Expr.relative[ cur ] ) {
				cur = "";
			} else {
				pop = parts.pop();
			}

			if ( pop == null ) {
				pop = context;
			}

			Expr.relative[ cur ]( checkSet, pop, isXML(context) );
		}
	}

	if ( !checkSet ) {
		checkSet = set;
	}

	if ( !checkSet ) {
		throw "Syntax error, unrecognized expression: " + (cur || selector);
	}

	if ( toString.call(checkSet) === "[object Array]" ) {
		if ( !prune ) {
			results.push.apply( results, checkSet );
		} else if ( context.nodeType === 1 ) {
			for ( var i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && contains(context, checkSet[i])) ) {
					results.push( set[i] );
				}
			}
		} else {
			for ( var i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
					results.push( set[i] );
				}
			}
		}
	} else {
		makeArray( checkSet, results );
	}

	if ( extra ) {
		Sizzle( extra, context, results, seed );

		if ( sortOrder ) {
			hasDuplicate = false;
			results.sort(sortOrder);

			if ( hasDuplicate ) {
				for ( var i = 1; i < results.length; i++ ) {
					if ( results[i] === results[i-1] ) {
						results.splice(i--, 1);
					}
				}
			}
		}
	}

	return results;
};

Sizzle.matches = function(expr, set){
	return Sizzle(expr, null, null, set);
};

Sizzle.find = function(expr, context, isXML){
	var set, match;

	if ( !expr ) {
		return [];
	}

	for ( var i = 0, l = Expr.order.length; i < l; i++ ) {
		var type = Expr.order[i], match;
		
		if ( (match = Expr.match[ type ].exec( expr )) ) {
			var left = RegExp.leftContext;

			if ( left.substr( left.length - 1 ) !== "\\" ) {
				match[1] = (match[1] || "").replace(/\\/g, "");
				set = Expr.find[ type ]( match, context, isXML );
				if ( set != null ) {
					expr = expr.replace( Expr.match[ type ], "" );
					break;
				}
			}
		}
	}

	if ( !set ) {
		set = context.getElementsByTagName("*");
	}

	return {set: set, expr: expr};
};

Sizzle.filter = function(expr, set, inplace, not){
	var old = expr, result = [], curLoop = set, match, anyFound,
		isXMLFilter = set && set[0] && isXML(set[0]);

	while ( expr && set.length ) {
		for ( var type in Expr.filter ) {
			if ( (match = Expr.match[ type ].exec( expr )) != null ) {
				var filter = Expr.filter[ type ], found, item;
				anyFound = false;

				if ( curLoop == result ) {
					result = [];
				}

				if ( Expr.preFilter[ type ] ) {
					match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

					if ( !match ) {
						anyFound = found = true;
					} else if ( match === true ) {
						continue;
					}
				}

				if ( match ) {
					for ( var i = 0; (item = curLoop[i]) != null; i++ ) {
						if ( item ) {
							found = filter( item, match, i, curLoop );
							var pass = not ^ !!found;

							if ( inplace && found != null ) {
								if ( pass ) {
									anyFound = true;
								} else {
									curLoop[i] = false;
								}
							} else if ( pass ) {
								result.push( item );
								anyFound = true;
							}
						}
					}
				}

				if ( found !== undefined ) {
					if ( !inplace ) {
						curLoop = result;
					}

					expr = expr.replace( Expr.match[ type ], "" );

					if ( !anyFound ) {
						return [];
					}

					break;
				}
			}
		}

		// Improper expression
		if ( expr == old ) {
			if ( anyFound == null ) {
				throw "Syntax error, unrecognized expression: " + expr;
			} else {
				break;
			}
		}

		old = expr;
	}

	return curLoop;
};

var Expr = Sizzle.selectors = {
	order: [ "ID", "NAME", "TAG" ],
	match: {
		ID: /#((?:[\w\u00c0-\uFFFF_-]|\\.)+)/,
		CLASS: /\.((?:[\w\u00c0-\uFFFF_-]|\\.)+)/,
		NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF_-]|\\.)+)['"]*\]/,
		ATTR: /\[\s*((?:[\w\u00c0-\uFFFF_-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,
		TAG: /^((?:[\w\u00c0-\uFFFF\*_-]|\\.)+)/,
		CHILD: /:(only|nth|last|first)-child(?:\((even|odd|[\dn+-]*)\))?/,
		POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^-]|$)/,
		PSEUDO: /:((?:[\w\u00c0-\uFFFF_-]|\\.)+)(?:\((['"]*)((?:\([^\)]+\)|[^\2\(\)]*)+)\2\))?/
	},
	attrMap: {
		"class": "className",
		"for": "htmlFor"
	},
	attrHandle: {
		href: function(elem){
			return elem.getAttribute("href");
		}
	},
	relative: {
		"+": function(checkSet, part, isXML){
			var isPartStr = typeof part === "string",
				isTag = isPartStr && !/\W/.test(part),
				isPartStrNotTag = isPartStr && !isTag;

			if ( isTag && !isXML ) {
				part = part.toUpperCase();
			}

			for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
				if ( (elem = checkSet[i]) ) {
					while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

					checkSet[i] = isPartStrNotTag || elem && elem.nodeName === part ?
						elem || false :
						elem === part;
				}
			}

			if ( isPartStrNotTag ) {
				Sizzle.filter( part, checkSet, true );
			}
		},
		">": function(checkSet, part, isXML){
			var isPartStr = typeof part === "string";

			if ( isPartStr && !/\W/.test(part) ) {
				part = isXML ? part : part.toUpperCase();

				for ( var i = 0, l = checkSet.length; i < l; i++ ) {
					var elem = checkSet[i];
					if ( elem ) {
						var parent = elem.parentNode;
						checkSet[i] = parent.nodeName === part ? parent : false;
					}
				}
			} else {
				for ( var i = 0, l = checkSet.length; i < l; i++ ) {
					var elem = checkSet[i];
					if ( elem ) {
						checkSet[i] = isPartStr ?
							elem.parentNode :
							elem.parentNode === part;
					}
				}

				if ( isPartStr ) {
					Sizzle.filter( part, checkSet, true );
				}
			}
		},
		"": function(checkSet, part, isXML){
			var doneName = done++, checkFn = dirCheck;

			if ( !part.match(/\W/) ) {
				var nodeCheck = part = isXML ? part : part.toUpperCase();
				checkFn = dirNodeCheck;
			}

			checkFn("parentNode", part, doneName, checkSet, nodeCheck, isXML);
		},
		"~": function(checkSet, part, isXML){
			var doneName = done++, checkFn = dirCheck;

			if ( typeof part === "string" && !part.match(/\W/) ) {
				var nodeCheck = part = isXML ? part : part.toUpperCase();
				checkFn = dirNodeCheck;
			}

			checkFn("previousSibling", part, doneName, checkSet, nodeCheck, isXML);
		}
	},
	find: {
		ID: function(match, context, isXML){
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				return m ? [m] : [];
			}
		},
		NAME: function(match, context, isXML){
			if ( typeof context.getElementsByName !== "undefined" ) {
				var ret = [], results = context.getElementsByName(match[1]);

				for ( var i = 0, l = results.length; i < l; i++ ) {
					if ( results[i].getAttribute("name") === match[1] ) {
						ret.push( results[i] );
					}
				}

				return ret.length === 0 ? null : ret;
			}
		},
		TAG: function(match, context){
			return context.getElementsByTagName(match[1]);
		}
	},
	preFilter: {
		CLASS: function(match, curLoop, inplace, result, not, isXML){
			match = " " + match[1].replace(/\\/g, "") + " ";

			if ( isXML ) {
				return match;
			}

			for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
				if ( elem ) {
					if ( not ^ (elem.className && (" " + elem.className + " ").indexOf(match) >= 0) ) {
						if ( !inplace )
							result.push( elem );
					} else if ( inplace ) {
						curLoop[i] = false;
					}
				}
			}

			return false;
		},
		ID: function(match){
			return match[1].replace(/\\/g, "");
		},
		TAG: function(match, curLoop){
			for ( var i = 0; curLoop[i] === false; i++ ){}
			return curLoop[i] && isXML(curLoop[i]) ? match[1] : match[1].toUpperCase();
		},
		CHILD: function(match){
			if ( match[1] == "nth" ) {
				// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
				var test = /(-?)(\d*)n((?:\+|-)?\d*)/.exec(
					match[2] == "even" && "2n" || match[2] == "odd" && "2n+1" ||
					!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

				// calculate the numbers (first)n+(last) including if they are negative
				match[2] = (test[1] + (test[2] || 1)) - 0;
				match[3] = test[3] - 0;
			}

			// TODO: Move to normal caching system
			match[0] = done++;

			return match;
		},
		ATTR: function(match, curLoop, inplace, result, not, isXML){
			var name = match[1].replace(/\\/g, "");
			
			if ( !isXML && Expr.attrMap[name] ) {
				match[1] = Expr.attrMap[name];
			}

			if ( match[2] === "~=" ) {
				match[4] = " " + match[4] + " ";
			}

			return match;
		},
		PSEUDO: function(match, curLoop, inplace, result, not){
			if ( match[1] === "not" ) {
				// If we're dealing with a complex expression, or a simple one
				if ( match[3].match(chunker).length > 1 || /^\w/.test(match[3]) ) {
					match[3] = Sizzle(match[3], null, null, curLoop);
				} else {
					var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);
					if ( !inplace ) {
						result.push.apply( result, ret );
					}
					return false;
				}
			} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
				return true;
			}
			
			return match;
		},
		POS: function(match){
			match.unshift( true );
			return match;
		}
	},
	filters: {
		enabled: function(elem){
			return elem.disabled === false && elem.type !== "hidden";
		},
		disabled: function(elem){
			return elem.disabled === true;
		},
		checked: function(elem){
			return elem.checked === true;
		},
		selected: function(elem){
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			elem.parentNode.selectedIndex;
			return elem.selected === true;
		},
		parent: function(elem){
			return !!elem.firstChild;
		},
		empty: function(elem){
			return !elem.firstChild;
		},
		has: function(elem, i, match){
			return !!Sizzle( match[3], elem ).length;
		},
		header: function(elem){
			return /h\d/i.test( elem.nodeName );
		},
		text: function(elem){
			return "text" === elem.type;
		},
		radio: function(elem){
			return "radio" === elem.type;
		},
		checkbox: function(elem){
			return "checkbox" === elem.type;
		},
		file: function(elem){
			return "file" === elem.type;
		},
		password: function(elem){
			return "password" === elem.type;
		},
		submit: function(elem){
			return "submit" === elem.type;
		},
		image: function(elem){
			return "image" === elem.type;
		},
		reset: function(elem){
			return "reset" === elem.type;
		},
		button: function(elem){
			return "button" === elem.type || elem.nodeName.toUpperCase() === "BUTTON";
		},
		input: function(elem){
			return /input|select|textarea|button/i.test(elem.nodeName);
		}
	},
	setFilters: {
		first: function(elem, i){
			return i === 0;
		},
		last: function(elem, i, match, array){
			return i === array.length - 1;
		},
		even: function(elem, i){
			return i % 2 === 0;
		},
		odd: function(elem, i){
			return i % 2 === 1;
		},
		lt: function(elem, i, match){
			return i < match[3] - 0;
		},
		gt: function(elem, i, match){
			return i > match[3] - 0;
		},
		nth: function(elem, i, match){
			return match[3] - 0 == i;
		},
		eq: function(elem, i, match){
			return match[3] - 0 == i;
		}
	},
	filter: {
		PSEUDO: function(elem, match, i, array){
			var name = match[1], filter = Expr.filters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			} else if ( name === "contains" ) {
				return (elem.textContent || elem.innerText || "").indexOf(match[3]) >= 0;
			} else if ( name === "not" ) {
				var not = match[3];

				for ( var i = 0, l = not.length; i < l; i++ ) {
					if ( not[i] === elem ) {
						return false;
					}
				}

				return true;
			}
		},
		CHILD: function(elem, match){
			var type = match[1], node = elem;
			switch (type) {
				case 'only':
				case 'first':
					while (node = node.previousSibling)  {
						if ( node.nodeType === 1 ) return false;
					}
					if ( type == 'first') return true;
					node = elem;
				case 'last':
					while (node = node.nextSibling)  {
						if ( node.nodeType === 1 ) return false;
					}
					return true;
				case 'nth':
					var first = match[2], last = match[3];

					if ( first == 1 && last == 0 ) {
						return true;
					}
					
					var doneName = match[0],
						parent = elem.parentNode;
	
					if ( parent && (parent.sizcache !== doneName || !elem.nodeIndex) ) {
						var count = 0;
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.nodeIndex = ++count;
							}
						} 
						parent.sizcache = doneName;
					}
					
					var diff = elem.nodeIndex - last;
					if ( first == 0 ) {
						return diff == 0;
					} else {
						return ( diff % first == 0 && diff / first >= 0 );
					}
			}
		},
		ID: function(elem, match){
			return elem.nodeType === 1 && elem.getAttribute("id") === match;
		},
		TAG: function(elem, match){
			return (match === "*" && elem.nodeType === 1) || elem.nodeName === match;
		},
		CLASS: function(elem, match){
			return (" " + (elem.className || elem.getAttribute("class")) + " ")
				.indexOf( match ) > -1;
		},
		ATTR: function(elem, match){
			var name = match[1],
				result = Expr.attrHandle[ name ] ?
					Expr.attrHandle[ name ]( elem ) :
					elem[ name ] != null ?
						elem[ name ] :
						elem.getAttribute( name ),
				value = result + "",
				type = match[2],
				check = match[4];

			return result == null ?
				type === "!=" :
				type === "=" ?
				value === check :
				type === "*=" ?
				value.indexOf(check) >= 0 :
				type === "~=" ?
				(" " + value + " ").indexOf(check) >= 0 :
				!check ?
				value && result !== false :
				type === "!=" ?
				value != check :
				type === "^=" ?
				value.indexOf(check) === 0 :
				type === "$=" ?
				value.substr(value.length - check.length) === check :
				type === "|=" ?
				value === check || value.substr(0, check.length + 1) === check + "-" :
				false;
		},
		POS: function(elem, match, i, array){
			var name = match[2], filter = Expr.setFilters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			}
		}
	}
};

var origPOS = Expr.match.POS;

for ( var type in Expr.match ) {
	Expr.match[ type ] = RegExp( Expr.match[ type ].source + /(?![^\[]*\])(?![^\(]*\))/.source );
}

var makeArray = function(array, results) {
	array = Array.prototype.slice.call( array );

	if ( results ) {
		results.push.apply( results, array );
		return results;
	}
	
	return array;
};

// Perform a simple check to determine if the browser is capable of
// converting a NodeList to an array using builtin methods.
try {
	Array.prototype.slice.call( document.documentElement.childNodes );

// Provide a fallback method if it does not work
} catch(e){
	makeArray = function(array, results) {
		var ret = results || [];

		if ( toString.call(array) === "[object Array]" ) {
			Array.prototype.push.apply( ret, array );
		} else {
			if ( typeof array.length === "number" ) {
				for ( var i = 0, l = array.length; i < l; i++ ) {
					ret.push( array[i] );
				}
			} else {
				for ( var i = 0; array[i]; i++ ) {
					ret.push( array[i] );
				}
			}
		}

		return ret;
	};
}

var sortOrder;

if ( document.documentElement.compareDocumentPosition ) {
	sortOrder = function( a, b ) {
		var ret = a.compareDocumentPosition(b) & 4 ? -1 : a === b ? 0 : 1;
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
} else if ( "sourceIndex" in document.documentElement ) {
	sortOrder = function( a, b ) {
		var ret = a.sourceIndex - b.sourceIndex;
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
} else if ( document.createRange ) {
	sortOrder = function( a, b ) {
		var aRange = a.ownerDocument.createRange(), bRange = b.ownerDocument.createRange();
		aRange.selectNode(a);
		aRange.collapse(true);
		bRange.selectNode(b);
		bRange.collapse(true);
		var ret = aRange.compareBoundaryPoints(Range.START_TO_END, bRange);
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
}

// Check to see if the browser returns elements by name when
// querying by getElementById (and provide a workaround)
(function(){
	// We're going to inject a fake input element with a specified name
	var form = document.createElement("form"),
		id = "script" + (new Date).getTime();
	form.innerHTML = "<input name='" + id + "'/>";

	// Inject it into the root element, check its status, and remove it quickly
	var root = document.documentElement;
	root.insertBefore( form, root.firstChild );

	// The workaround has to do additional checks after a getElementById
	// Which slows things down for other browsers (hence the branching)
	if ( !!document.getElementById( id ) ) {
		Expr.find.ID = function(match, context, isXML){
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				return m ? m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ? [m] : undefined : [];
			}
		};

		Expr.filter.ID = function(elem, match){
			var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
			return elem.nodeType === 1 && node && node.nodeValue === match;
		};
	}

	root.removeChild( form );
})();

(function(){
	// Check to see if the browser returns only elements
	// when doing getElementsByTagName("*")

	// Create a fake element
	var div = document.createElement("div");
	div.appendChild( document.createComment("") );

	// Make sure no comments are found
	if ( div.getElementsByTagName("*").length > 0 ) {
		Expr.find.TAG = function(match, context){
			var results = context.getElementsByTagName(match[1]);

			// Filter out possible comments
			if ( match[1] === "*" ) {
				var tmp = [];

				for ( var i = 0; results[i]; i++ ) {
					if ( results[i].nodeType === 1 ) {
						tmp.push( results[i] );
					}
				}

				results = tmp;
			}

			return results;
		};
	}

	// Check to see if an attribute returns normalized href attributes
	div.innerHTML = "<a href='#'></a>";
	if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
			div.firstChild.getAttribute("href") !== "#" ) {
		Expr.attrHandle.href = function(elem){
			return elem.getAttribute("href", 2);
		};
	}
})();

if ( document.querySelectorAll ) (function(){
	var oldSizzle = Sizzle, div = document.createElement("div");
	div.innerHTML = "<p class='TEST'></p>";

	// Safari can't handle uppercase or unicode characters when
	// in quirks mode.
	if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
		return;
	}
	
	Sizzle = function(query, context, extra, seed){
		context = context || document;

		// Only use querySelectorAll on non-XML documents
		// (ID selectors don't work in non-HTML documents)
		if ( !seed && context.nodeType === 9 && !isXML(context) ) {
			try {
				return makeArray( context.querySelectorAll(query), extra );
			} catch(e){}
		}
		
		return oldSizzle(query, context, extra, seed);
	};

	Sizzle.find = oldSizzle.find;
	Sizzle.filter = oldSizzle.filter;
	Sizzle.selectors = oldSizzle.selectors;
	Sizzle.matches = oldSizzle.matches;
})();

if ( document.getElementsByClassName && document.documentElement.getElementsByClassName ) (function(){
	var div = document.createElement("div");
	div.innerHTML = "<div class='test e'></div><div class='test'></div>";

	// Opera can't find a second classname (in 9.6)
	if ( div.getElementsByClassName("e").length === 0 )
		return;

	// Safari caches class attributes, doesn't catch changes (in 3.2)
	div.lastChild.className = "e";

	if ( div.getElementsByClassName("e").length === 1 )
		return;

	Expr.order.splice(1, 0, "CLASS");
	Expr.find.CLASS = function(match, context, isXML) {
		if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
			return context.getElementsByClassName(match[1]);
		}
	};
})();

function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	var sibDir = dir == "previousSibling" && !isXML;
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];
		if ( elem ) {
			if ( sibDir && elem.nodeType === 1 ){
				elem.sizcache = doneName;
				elem.sizset = i;
			}
			elem = elem[dir];
			var match = false;

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 && !isXML ){
					elem.sizcache = doneName;
					elem.sizset = i;
				}

				if ( elem.nodeName === cur ) {
					match = elem;
					break;
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	var sibDir = dir == "previousSibling" && !isXML;
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];
		if ( elem ) {
			if ( sibDir && elem.nodeType === 1 ) {
				elem.sizcache = doneName;
				elem.sizset = i;
			}
			elem = elem[dir];
			var match = false;

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 ) {
					if ( !isXML ) {
						elem.sizcache = doneName;
						elem.sizset = i;
					}
					if ( typeof cur !== "string" ) {
						if ( elem === cur ) {
							match = true;
							break;
						}

					} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
						match = elem;
						break;
					}
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

var contains = document.compareDocumentPosition ?  function(a, b){
	return a.compareDocumentPosition(b) & 16;
} : function(a, b){
	return a !== b && (a.contains ? a.contains(b) : true);
};

var isXML = function(elem){
	return elem.nodeType === 9 && elem.documentElement.nodeName !== "HTML" ||
		!!elem.ownerDocument && isXML( elem.ownerDocument );
};

var posProcess = function(selector, context){
	var tmpSet = [], later = "", match,
		root = context.nodeType ? [context] : context;

	// Position selectors must be done after the filter
	// And so must :not(positional) so we move all PSEUDOs to the end
	while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
		later += match[0];
		selector = selector.replace( Expr.match.PSEUDO, "" );
	}

	selector = Expr.relative[selector] ? selector + "*" : selector;

	for ( var i = 0, l = root.length; i < l; i++ ) {
		Sizzle( selector, root[i], tmpSet );
	}

	return Sizzle.filter( later, tmpSet );
};

// EXPOSE
jQuery.find = Sizzle;
jQuery.filter = Sizzle.filter;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.filters;

Sizzle.selectors.filters.hidden = function(elem){
	return elem.offsetWidth === 0 || elem.offsetHeight === 0;
};

Sizzle.selectors.filters.visible = function(elem){
	return elem.offsetWidth > 0 || elem.offsetHeight > 0;
};

Sizzle.selectors.filters.animated = function(elem){
	return jQuery.grep(jQuery.timers, function(fn){
		return elem === fn.elem;
	}).length;
};

jQuery.multiFilter = function( expr, elems, not ) {
	if ( not ) {
		expr = ":not(" + expr + ")";
	}

	return Sizzle.matches(expr, elems);
};

jQuery.dir = function( elem, dir ){
	var matched = [], cur = elem[dir];
	while ( cur && cur != document ) {
		if ( cur.nodeType == 1 )
			matched.push( cur );
		cur = cur[dir];
	}
	return matched;
};

jQuery.nth = function(cur, result, dir, elem){
	result = result || 1;
	var num = 0;

	for ( ; cur; cur = cur[dir] )
		if ( cur.nodeType == 1 && ++num == result )
			break;

	return cur;
};

jQuery.sibling = function(n, elem){
	var r = [];

	for ( ; n; n = n.nextSibling ) {
		if ( n.nodeType == 1 && n != elem )
			r.push( n );
	}

	return r;
};

return;

window.Sizzle = Sizzle;

})();
/*
 * A number of helper functions used for managing events.
 * Many of the ideas behind this code originated from
 * Dean Edwards' addEvent library.
 */
jQuery.event = {

	// Bind an event to an element
	// Original by Dean Edwards
	add: function(elem, types, handler, data) {
		if ( elem.nodeType == 3 || elem.nodeType == 8 )
			return;

		// For whatever reason, IE has trouble passing the window object
		// around, causing it to be cloned in the process
		if ( elem.setInterval && elem != window )
			elem = window;

		// Make sure that the function being executed has a unique ID
		if ( !handler.guid )
			handler.guid = this.guid++;

		// if data is passed, bind to handler
		if ( data !== undefined ) {
			// Create temporary function pointer to original handler
			var fn = handler;

			// Create unique handler function, wrapped around original handler
			handler = this.proxy( fn );

			// Store data in unique handler
			handler.data = data;
		}

		// Init the element's event structure
		var events = jQuery.data(elem, "events") || jQuery.data(elem, "events", {}),
			handle = jQuery.data(elem, "handle") || jQuery.data(elem, "handle", function(){
				// Handle the second event of a trigger and when
				// an event is called after a page has unloaded
				return typeof jQuery !== "undefined" && !jQuery.event.triggered ?
					jQuery.event.handle.apply(arguments.callee.elem, arguments) :
					undefined;
			});
		// Add elem as a property of the handle function
		// This is to prevent a memory leak with non-native
		// event in IE.
		handle.elem = elem;

		// Handle multiple events separated by a space
		// jQuery(...).bind("mouseover mouseout", fn);
		jQuery.each(types.split(/\s+/), function(index, type) {
			// Namespaced event handlers
			var namespaces = type.split(".");
			type = namespaces.shift();
			handler.type = namespaces.slice().sort().join(".");

			// Get the current list of functions bound to this event
			var handlers = events[type];
			
			if ( jQuery.event.specialAll[type] )
				jQuery.event.specialAll[type].setup.call(elem, data, namespaces);

			// Init the event handler queue
			if (!handlers) {
				handlers = events[type] = {};

				// Check for a special event handler
				// Only use addEventListener/attachEvent if the special
				// events handler returns false
				if ( !jQuery.event.special[type] || jQuery.event.special[type].setup.call(elem, data, namespaces) === false ) {
					// Bind the global event handler to the element
					if (elem.addEventListener)
						elem.addEventListener(type, handle, false);
					else if (elem.attachEvent)
						elem.attachEvent("on" + type, handle);
				}
			}

			// Add the function to the element's handler list
			handlers[handler.guid] = handler;

			// Keep track of which events have been used, for global triggering
			jQuery.event.global[type] = true;
		});

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	guid: 1,
	global: {},

	// Detach an event or set of events from an element
	remove: function(elem, types, handler) {
		// don't do events on text and comment nodes
		if ( elem.nodeType == 3 || elem.nodeType == 8 )
			return;

		var events = jQuery.data(elem, "events"), ret, index;

		if ( events ) {
			// Unbind all events for the element
			if ( types === undefined || (typeof types === "string" && types.charAt(0) == ".") )
				for ( var type in events )
					this.remove( elem, type + (types || "") );
			else {
				// types is actually an event object here
				if ( types.type ) {
					handler = types.handler;
					types = types.type;
				}

				// Handle multiple events seperated by a space
				// jQuery(...).unbind("mouseover mouseout", fn);
				jQuery.each(types.split(/\s+/), function(index, type){
					// Namespaced event handlers
					var namespaces = type.split(".");
					type = namespaces.shift();
					var namespace = RegExp("(^|\\.)" + namespaces.slice().sort().join(".*\\.") + "(\\.|$)");

					if ( events[type] ) {
						// remove the given handler for the given type
						if ( handler )
							delete events[type][handler.guid];

						// remove all handlers for the given type
						else
							for ( var handle in events[type] )
								// Handle the removal of namespaced events
								if ( namespace.test(events[type][handle].type) )
									delete events[type][handle];
									
						if ( jQuery.event.specialAll[type] )
							jQuery.event.specialAll[type].teardown.call(elem, namespaces);

						// remove generic event handler if no more handlers exist
						for ( ret in events[type] ) break;
						if ( !ret ) {
							if ( !jQuery.event.special[type] || jQuery.event.special[type].teardown.call(elem, namespaces) === false ) {
								if (elem.removeEventListener)
									elem.removeEventListener(type, jQuery.data(elem, "handle"), false);
								else if (elem.detachEvent)
									elem.detachEvent("on" + type, jQuery.data(elem, "handle"));
							}
							ret = null;
							delete events[type];
						}
					}
				});
			}

			// Remove the expando if it's no longer used
			for ( ret in events ) break;
			if ( !ret ) {
				var handle = jQuery.data( elem, "handle" );
				if ( handle ) handle.elem = null;
				jQuery.removeData( elem, "events" );
				jQuery.removeData( elem, "handle" );
			}
		}
	},

	// bubbling is internal
	trigger: function( event, data, elem, bubbling ) {
		// Event object or event type
		var type = event.type || event;

		if( !bubbling ){
			event = typeof event === "object" ?
				// jQuery.Event object
				event[expando] ? event :
				// Object literal
				jQuery.extend( jQuery.Event(type), event ) :
				// Just the event type (string)
				jQuery.Event(type);

			if ( type.indexOf("!") >= 0 ) {
				event.type = type = type.slice(0, -1);
				event.exclusive = true;
			}

			// Handle a global trigger
			if ( !elem ) {
				// Don't bubble custom events when global (to avoid too much overhead)
				event.stopPropagation();
				// Only trigger if we've ever bound an event for it
				if ( this.global[type] )
					jQuery.each( jQuery.cache, function(){
						if ( this.events && this.events[type] )
							jQuery.event.trigger( event, data, this.handle.elem );
					});
			}

			// Handle triggering a single element

			// don't do events on text and comment nodes
			if ( !elem || elem.nodeType == 3 || elem.nodeType == 8 )
				return undefined;
			
			// Clean up in case it is reused
			event.result = undefined;
			event.target = elem;
			
			// Clone the incoming data, if any
			data = jQuery.makeArray(data);
			data.unshift( event );
		}

		event.currentTarget = elem;

		// Trigger the event, it is assumed that "handle" is a function
		var handle = jQuery.data(elem, "handle");
		if ( handle )
			handle.apply( elem, data );

		// Handle triggering native .onfoo handlers (and on links since we don't call .click() for links)
		if ( (!elem[type] || (jQuery.nodeName(elem, 'a') && type == "click")) && elem["on"+type] && elem["on"+type].apply( elem, data ) === false )
			event.result = false;

		// Trigger the native events (except for clicks on links)
		if ( !bubbling && elem[type] && !event.isDefaultPrevented() && !(jQuery.nodeName(elem, 'a') && type == "click") ) {
			this.triggered = true;
			try {
				elem[ type ]();
			// prevent IE from throwing an error for some hidden elements
			} catch (e) {}
		}

		this.triggered = false;

		if ( !event.isPropagationStopped() ) {
			var parent = elem.parentNode || elem.ownerDocument;
			if ( parent )
				jQuery.event.trigger(event, data, parent, true);
		}
	},

	handle: function(event) {
		// returned undefined or false
		var all, handlers;

		event = arguments[0] = jQuery.event.fix( event || window.event );
		event.currentTarget = this;
		
		// Namespaced event handlers
		var namespaces = event.type.split(".");
		event.type = namespaces.shift();

		// Cache this now, all = true means, any handler
		all = !namespaces.length && !event.exclusive;
		
		var namespace = RegExp("(^|\\.)" + namespaces.slice().sort().join(".*\\.") + "(\\.|$)");

		handlers = ( jQuery.data(this, "events") || {} )[event.type];

		for ( var j in handlers ) {
			var handler = handlers[j];

			// Filter the functions by class
			if ( all || namespace.test(handler.type) ) {
				// Pass in a reference to the handler function itself
				// So that we can later remove it
				event.handler = handler;
				event.data = handler.data;

				var ret = handler.apply(this, arguments);

				if( ret !== undefined ){
					event.result = ret;
					if ( ret === false ) {
						event.preventDefault();
						event.stopPropagation();
					}
				}

				if( event.isImmediatePropagationStopped() )
					break;

			}
		}
	},

	props: "altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode metaKey newValue originalTarget pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "),

	fix: function(event) {
		if ( event[expando] )
			return event;

		// store a copy of the original event object
		// and "clone" to set read-only properties
		var originalEvent = event;
		event = jQuery.Event( originalEvent );

		for ( var i = this.props.length, prop; i; ){
			prop = this.props[ --i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Fix target property, if necessary
		if ( !event.target )
			event.target = event.srcElement || document; // Fixes #1925 where srcElement might not be defined either

		// check if target is a textnode (safari)
		if ( event.target.nodeType == 3 )
			event.target = event.target.parentNode;

		// Add relatedTarget, if necessary
		if ( !event.relatedTarget && event.fromElement )
			event.relatedTarget = event.fromElement == event.target ? event.toElement : event.fromElement;

		// Calculate pageX/Y if missing and clientX/Y available
		if ( event.pageX == null && event.clientX != null ) {
			var doc = document.documentElement, body = document.body;
			event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc.clientLeft || 0);
			event.pageY = event.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc.clientTop || 0);
		}

		// Add which for key events
		if ( !event.which && ((event.charCode || event.charCode === 0) ? event.charCode : event.keyCode) )
			event.which = event.charCode || event.keyCode;

		// Add metaKey to non-Mac browsers (use ctrl for PC's and Meta for Macs)
		if ( !event.metaKey && event.ctrlKey )
			event.metaKey = event.ctrlKey;

		// Add which for click: 1 == left; 2 == middle; 3 == right
		// Note: button is not normalized, so don't use it
		if ( !event.which && event.button )
			event.which = (event.button & 1 ? 1 : ( event.button & 2 ? 3 : ( event.button & 4 ? 2 : 0 ) ));

		return event;
	},

	proxy: function( fn, proxy ){
		proxy = proxy || function(){ return fn.apply(this, arguments); };
		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || proxy.guid || this.guid++;
		// So proxy can be declared as an argument
		return proxy;
	},

	special: {
		ready: {
			// Make sure the ready event is setup
			setup: bindReady,
			teardown: function() {}
		}
	},
	
	specialAll: {
		live: {
			setup: function( selector, namespaces ){
				jQuery.event.add( this, namespaces[0], liveHandler );
			},
			teardown:  function( namespaces ){
				if ( namespaces.length ) {
					var remove = 0, name = RegExp("(^|\\.)" + namespaces[0] + "(\\.|$)");
					
					jQuery.each( (jQuery.data(this, "events").live || {}), function(){
						if ( name.test(this.type) )
							remove++;
					});
					
					if ( remove < 1 )
						jQuery.event.remove( this, namespaces[0], liveHandler );
				}
			}
		}
	}
};

jQuery.Event = function( src ){
	// Allow instantiation without the 'new' keyword
	if( !this.preventDefault )
		return new jQuery.Event(src);
	
	// Event object
	if( src && src.type ){
		this.originalEvent = src;
		this.type = src.type;
	// Event type
	}else
		this.type = src;

	// timeStamp is buggy for some events on Firefox(#3843)
	// So we won't rely on the native value
	this.timeStamp = now();
	
	// Mark it as fixed
	this[expando] = true;
};

function returnFalse(){
	return false;
}
function returnTrue(){
	return true;
}

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	preventDefault: function() {
		this.isDefaultPrevented = returnTrue;

		var e = this.originalEvent;
		if( !e )
			return;
		// if preventDefault exists run it on the original event
		if (e.preventDefault)
			e.preventDefault();
		// otherwise set the returnValue property of the original event to false (IE)
		e.returnValue = false;
	},
	stopPropagation: function() {
		this.isPropagationStopped = returnTrue;

		var e = this.originalEvent;
		if( !e )
			return;
		// if stopPropagation exists run it on the original event
		if (e.stopPropagation)
			e.stopPropagation();
		// otherwise set the cancelBubble property of the original event to true (IE)
		e.cancelBubble = true;
	},
	stopImmediatePropagation:function(){
		this.isImmediatePropagationStopped = returnTrue;
		this.stopPropagation();
	},
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse
};
// Checks if an event happened on an element within another element
// Used in jQuery.event.special.mouseenter and mouseleave handlers
var withinElement = function(event) {
	// Check if mouse(over|out) are still within the same parent element
	var parent = event.relatedTarget;
	// Traverse up the tree
	while ( parent && parent != this )
		try { parent = parent.parentNode; }
		catch(e) { parent = this; }
	
	if( parent != this ){
		// set the correct event type
		event.type = event.data;
		// handle event if we actually just moused on to a non sub-element
		jQuery.event.handle.apply( this, arguments );
	}
};
	
jQuery.each({ 
	mouseover: 'mouseenter', 
	mouseout: 'mouseleave'
}, function( orig, fix ){
	jQuery.event.special[ fix ] = {
		setup: function(){
			jQuery.event.add( this, orig, withinElement, fix );
		},
		teardown: function(){
			jQuery.event.remove( this, orig, withinElement );
		}
	};			   
});

jQuery.fn.extend({
	bind: function( type, data, fn ) {
		return type == "unload" ? this.one(type, data, fn) : this.each(function(){
			jQuery.event.add( this, type, fn || data, fn && data );
		});
	},

	one: function( type, data, fn ) {
		var one = jQuery.event.proxy( fn || data, function(event) {
			jQuery(this).unbind(event, one);
			return (fn || data).apply( this, arguments );
		});
		return this.each(function(){
			jQuery.event.add( this, type, one, fn && data);
		});
	},

	unbind: function( type, fn ) {
		return this.each(function(){
			jQuery.event.remove( this, type, fn );
		});
	},

	trigger: function( type, data ) {
		return this.each(function(){
			jQuery.event.trigger( type, data, this );
		});
	},

	triggerHandler: function( type, data ) {
		if( this[0] ){
			var event = jQuery.Event(type);
			event.preventDefault();
			event.stopPropagation();
			jQuery.event.trigger( event, data, this[0] );
			return event.result;
		}		
	},

	toggle: function( fn ) {
		// Save reference to arguments for access in closure
		var args = arguments, i = 1;

		// link all the functions, so any of them can unbind this click handler
		while( i < args.length )
			jQuery.event.proxy( fn, args[i++] );

		return this.click( jQuery.event.proxy( fn, function(event) {
			// Figure out which function to execute
			this.lastToggle = ( this.lastToggle || 0 ) % i;

			// Make sure that clicks stop
			event.preventDefault();

			// and execute the function
			return args[ this.lastToggle++ ].apply( this, arguments ) || false;
		}));
	},

	hover: function(fnOver, fnOut) {
		return this.mouseenter(fnOver).mouseleave(fnOut);
	},

	ready: function(fn) {
		// Attach the listeners
		bindReady();

		// If the DOM is already ready
		if ( jQuery.isReady )
			// Execute the function immediately
			fn.call( document, jQuery );

		// Otherwise, remember the function for later
		else
			// Add the function to the wait list
			jQuery.readyList.push( fn );

		return this;
	},
	
	live: function( type, fn ){
		var proxy = jQuery.event.proxy( fn );
		proxy.guid += this.selector + type;

		jQuery(document).bind( liveConvert(type, this.selector), this.selector, proxy );

		return this;
	},
	
	die: function( type, fn ){
		jQuery(document).unbind( liveConvert(type, this.selector), fn ? { guid: fn.guid + this.selector + type } : null );
		return this;
	}
});

function liveHandler( event ){
	var check = RegExp("(^|\\.)" + event.type + "(\\.|$)"),
		stop = true,
		elems = [];

	jQuery.each(jQuery.data(this, "events").live || [], function(i, fn){
		if ( check.test(fn.type) ) {
			var elem = jQuery(event.target).closest(fn.data)[0];
			if ( elem )
				elems.push({ elem: elem, fn: fn });
		}
	});

	elems.sort(function(a,b) {
		return jQuery.data(a.elem, "closest") - jQuery.data(b.elem, "closest");
	});
	
	jQuery.each(elems, function(){
		if ( this.fn.call(this.elem, event, this.fn.data) === false )
			return (stop = false);
	});

	return stop;
}

function liveConvert(type, selector){
	return ["live", type, selector.replace(/\./g, "`").replace(/ /g, "|")].join(".");
}

jQuery.extend({
	isReady: false,
	readyList: [],
	// Handle when the DOM is ready
	ready: function() {
		// Make sure that the DOM is not already loaded
		if ( !jQuery.isReady ) {
			// Remember that the DOM is ready
			jQuery.isReady = true;

			// If there are functions bound, to execute
			if ( jQuery.readyList ) {
				// Execute all of them
				jQuery.each( jQuery.readyList, function(){
					this.call( document, jQuery );
				});

				// Reset the list of functions
				jQuery.readyList = null;
			}

			// Trigger any bound ready events
			jQuery(document).triggerHandler("ready");
		}
	}
});

var readyBound = false;

function bindReady(){
	if ( readyBound ) return;
	readyBound = true;

	// Mozilla, Opera and webkit nightlies currently support this event
	if ( document.addEventListener ) {
		// Use the handy event callback
		document.addEventListener( "DOMContentLoaded", function(){
			document.removeEventListener( "DOMContentLoaded", arguments.callee, false );
			jQuery.ready();
		}, false );

	// If IE event model is used
	} else if ( document.attachEvent ) {
		// ensure firing before onload,
		// maybe late but safe also for iframes
		document.attachEvent("onreadystatechange", function(){
			if ( document.readyState === "complete" ) {
				document.detachEvent( "onreadystatechange", arguments.callee );
				jQuery.ready();
			}
		});

		// If IE and not an iframe
		// continually check to see if the document is ready
		if ( document.documentElement.doScroll && window == window.top ) (function(){
			if ( jQuery.isReady ) return;

			try {
				// If IE is used, use the trick by Diego Perini
				// http://javascript.nwbox.com/IEContentLoaded/
				document.documentElement.doScroll("left");
			} catch( error ) {
				setTimeout( arguments.callee, 0 );
				return;
			}

			// and execute any waiting functions
			jQuery.ready();
		})();
	}

	// A fallback to window.onload, that will always work
	jQuery.event.add( window, "load", jQuery.ready );
}

jQuery.each( ("blur,focus,load,resize,scroll,unload,click,dblclick," +
	"mousedown,mouseup,mousemove,mouseover,mouseout,mouseenter,mouseleave," +
	"change,select,submit,keydown,keypress,keyup,error").split(","), function(i, name){

	// Handle event binding
	jQuery.fn[name] = function(fn){
		return fn ? this.bind(name, fn) : this.trigger(name);
	};
});

// Prevent memory leaks in IE
// And prevent errors on refresh with events like mouseover in other browsers
// Window isn't included so as not to unbind existing unload events
jQuery( window ).bind( 'unload', function(){ 
	for ( var id in jQuery.cache )
		// Skip the window
		if ( id != 1 && jQuery.cache[ id ].handle )
			jQuery.event.remove( jQuery.cache[ id ].handle.elem );
}); 
(function(){

	jQuery.support = {};

	var root = document.documentElement,
		script = document.createElement("script"),
		div = document.createElement("div"),
		id = "script" + (new Date).getTime();

	div.style.display = "none";
	div.innerHTML = '   <link/><table></table><a href="/a" style="color:red;float:left;opacity:.5;">a</a><select><option>text</option></select><object><param/></object>';

	var all = div.getElementsByTagName("*"),
		a = div.getElementsByTagName("a")[0];

	// Can't get basic test support
	if ( !all || !all.length || !a ) {
		return;
	}

	jQuery.support = {
		// IE strips leading whitespace when .innerHTML is used
		leadingWhitespace: div.firstChild.nodeType == 3,
		
		// Make sure that tbody elements aren't automatically inserted
		// IE will insert them into empty tables
		tbody: !div.getElementsByTagName("tbody").length,
		
		// Make sure that you can get all elements in an <object> element
		// IE 7 always returns no results
		objectAll: !!div.getElementsByTagName("object")[0]
			.getElementsByTagName("*").length,
		
		// Make sure that link elements get serialized correctly by innerHTML
		// This requires a wrapper element in IE
		htmlSerialize: !!div.getElementsByTagName("link").length,
		
		// Get the style information from getAttribute
		// (IE uses .cssText insted)
		style: /red/.test( a.getAttribute("style") ),
		
		// Make sure that URLs aren't manipulated
		// (IE normalizes it by default)
		hrefNormalized: a.getAttribute("href") === "/a",
		
		// Make sure that element opacity exists
		// (IE uses filter instead)
		opacity: a.style.opacity === "0.5",
		
		// Verify style float existence
		// (IE uses styleFloat instead of cssFloat)
		cssFloat: !!a.style.cssFloat,

		// Will be defined later
		scriptEval: false,
		noCloneEvent: true,
		boxModel: null
	};
	
	script.type = "text/javascript";
	try {
		script.appendChild( document.createTextNode( "window." + id + "=1;" ) );
	} catch(e){}

	root.insertBefore( script, root.firstChild );
	
	// Make sure that the execution of code works by injecting a script
	// tag with appendChild/createTextNode
	// (IE doesn't support this, fails, and uses .text instead)
	if ( window[ id ] ) {
		jQuery.support.scriptEval = true;
		delete window[ id ];
	}

	root.removeChild( script );

	if ( div.attachEvent && div.fireEvent ) {
		div.attachEvent("onclick", function(){
			// Cloning a node shouldn't copy over any
			// bound event handlers (IE does this)
			jQuery.support.noCloneEvent = false;
			div.detachEvent("onclick", arguments.callee);
		});
		div.cloneNode(true).fireEvent("onclick");
	}

	// Figure out if the W3C box model works as expected
	// document.body must exist before we can do this
	jQuery(function(){
		var div = document.createElement("div");
		div.style.width = div.style.paddingLeft = "1px";

		document.body.appendChild( div );
		jQuery.boxModel = jQuery.support.boxModel = div.offsetWidth === 2;
		document.body.removeChild( div ).style.display = 'none';
	});
})();

var styleFloat = jQuery.support.cssFloat ? "cssFloat" : "styleFloat";

jQuery.props = {
	"for": "htmlFor",
	"class": "className",
	"float": styleFloat,
	cssFloat: styleFloat,
	styleFloat: styleFloat,
	readonly: "readOnly",
	maxlength: "maxLength",
	cellspacing: "cellSpacing",
	rowspan: "rowSpan",
	tabindex: "tabIndex"
};
jQuery.fn.extend({
	// Keep a copy of the old load
	_load: jQuery.fn.load,

	load: function( url, params, callback ) {
		if ( typeof url !== "string" )
			return this._load( url );

		var off = url.indexOf(" ");
		if ( off >= 0 ) {
			var selector = url.slice(off, url.length);
			url = url.slice(0, off);
		}

		// Default to a GET request
		var type = "GET";

		// If the second parameter was provided
		if ( params )
			// If it's a function
			if ( jQuery.isFunction( params ) ) {
				// We assume that it's the callback
				callback = params;
				params = null;

			// Otherwise, build a param string
			} else if( typeof params === "object" ) {
				params = jQuery.param( params );
				type = "POST";
			}

		var self = this;

		// Request the remote document
		jQuery.ajax({
			url: url,
			type: type,
			dataType: "html",
			data: params,
			complete: function(res, status){
				// If successful, inject the HTML into all the matched elements
				if ( status == "success" || status == "notmodified" )
					// See if a selector was specified
					self.html( selector ?
						// Create a dummy div to hold the results
						jQuery("<div/>")
							// inject the contents of the document in, removing the scripts
							// to avoid any 'Permission Denied' errors in IE
							.append(res.responseText.replace(/<script(.|\s)*?\/script>/g, ""))

							// Locate the specified elements
							.find(selector) :

						// If not, just inject the full result
						res.responseText );

				if( callback )
					self.each( callback, [res.responseText, status, res] );
			}
		});
		return this;
	},

	serialize: function() {
		return jQuery.param(this.serializeArray());
	},
	serializeArray: function() {
		return this.map(function(){
			return this.elements ? jQuery.makeArray(this.elements) : this;
		})
		.filter(function(){
			return this.name && !this.disabled &&
				(this.checked || /select|textarea/i.test(this.nodeName) ||
					/text|hidden|password|search/i.test(this.type));
		})
		.map(function(i, elem){
			var val = jQuery(this).val();
			return val == null ? null :
				jQuery.isArray(val) ?
					jQuery.map( val, function(val, i){
						return {name: elem.name, value: val};
					}) :
					{name: elem.name, value: val};
		}).get();
	}
});

// Attach a bunch of functions for handling common AJAX events
jQuery.each( "ajaxStart,ajaxStop,ajaxComplete,ajaxError,ajaxSuccess,ajaxSend".split(","), function(i,o){
	jQuery.fn[o] = function(f){
		return this.bind(o, f);
	};
});

var jsc = now();

jQuery.extend({
  
	get: function( url, data, callback, type ) {
		// shift arguments if data argument was ommited
		if ( jQuery.isFunction( data ) ) {
			callback = data;
			data = null;
		}

		return jQuery.ajax({
			type: "GET",
			url: url,
			data: data,
			success: callback,
			dataType: type
		});
	},

	getScript: function( url, callback ) {
		return jQuery.get(url, null, callback, "script");
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get(url, data, callback, "json");
	},

	post: function( url, data, callback, type ) {
		if ( jQuery.isFunction( data ) ) {
			callback = data;
			data = {};
		}

		return jQuery.ajax({
			type: "POST",
			url: url,
			data: data,
			success: callback,
			dataType: type
		});
	},

	ajaxSetup: function( settings ) {
		jQuery.extend( jQuery.ajaxSettings, settings );
	},

	ajaxSettings: {
		url: location.href,
		global: true,
		type: "GET",
		contentType: "application/x-www-form-urlencoded",
		processData: true,
		async: true,
		/*
		timeout: 0,
		data: null,
		username: null,
		password: null,
		*/
		// Create the request object; Microsoft failed to properly
		// implement the XMLHttpRequest in IE7, so we use the ActiveXObject when it is available
		// This function can be overriden by calling jQuery.ajaxSetup
		xhr:function(){
			return window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
		},
		accepts: {
			xml: "application/xml, text/xml",
			html: "text/html",
			script: "text/javascript, application/javascript",
			json: "application/json, text/javascript",
			text: "text/plain",
			_default: "*/*"
		}
	},

	// Last-Modified header cache for next request
	lastModified: {},

	ajax: function( s ) {
		// Extend the settings, but re-extend 's' so that it can be
		// checked again later (in the test suite, specifically)
		s = jQuery.extend(true, s, jQuery.extend(true, {}, jQuery.ajaxSettings, s));

		var jsonp, jsre = /=\?(&|$)/g, status, data,
			type = s.type.toUpperCase();

		// convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" )
			s.data = jQuery.param(s.data);

		// Handle JSONP Parameter Callbacks
		if ( s.dataType == "jsonp" ) {
			if ( type == "GET" ) {
				if ( !s.url.match(jsre) )
					s.url += (s.url.match(/\?/) ? "&" : "?") + (s.jsonp || "callback") + "=?";
			} else if ( !s.data || !s.data.match(jsre) )
				s.data = (s.data ? s.data + "&" : "") + (s.jsonp || "callback") + "=?";
			s.dataType = "json";
		}

		// Build temporary JSONP function
		if ( s.dataType == "json" && (s.data && s.data.match(jsre) || s.url.match(jsre)) ) {
			jsonp = "jsonp" + jsc++;

			// Replace the =? sequence both in the query string and the data
			if ( s.data )
				s.data = (s.data + "").replace(jsre, "=" + jsonp + "$1");
			s.url = s.url.replace(jsre, "=" + jsonp + "$1");

			// We need to make sure
			// that a JSONP style response is executed properly
			s.dataType = "script";

			// Handle JSONP-style loading
			window[ jsonp ] = function(tmp){
				data = tmp;
				success();
				complete();
				// Garbage collect
				window[ jsonp ] = undefined;
				try{ delete window[ jsonp ]; } catch(e){}
				if ( head )
					head.removeChild( script );
			};
		}

		if ( s.dataType == "script" && s.cache == null )
			s.cache = false;

		if ( s.cache === false && type == "GET" ) {
			var ts = now();
			// try replacing _= if it is there
			var ret = s.url.replace(/(\?|&)_=.*?(&|$)/, "$1_=" + ts + "$2");
			// if nothing was replaced, add timestamp to the end
			s.url = ret + ((ret == s.url) ? (s.url.match(/\?/) ? "&" : "?") + "_=" + ts : "");
		}

		// If data is available, append data to url for get requests
		if ( s.data && type == "GET" ) {
			s.url += (s.url.match(/\?/) ? "&" : "?") + s.data;

			// IE likes to send both get and post data, prevent this
			s.data = null;
		}

		// Watch for a new set of requests
		if ( s.global && ! jQuery.active++ )
			jQuery.event.trigger( "ajaxStart" );

		// Matches an absolute URL, and saves the domain
		var parts = /^(\w+:)?\/\/([^\/?#]+)/.exec( s.url );

		// If we're requesting a remote document
		// and trying to load JSON or Script with a GET
		if ( s.dataType == "script" && type == "GET" && parts
			&& ( parts[1] && parts[1] != location.protocol || parts[2] != location.host )){

			var head = document.getElementsByTagName("head")[0];
			var script = document.createElement("script");
			script.src = s.url;
			if (s.scriptCharset)
				script.charset = s.scriptCharset;

			// Handle Script loading
			if ( !jsonp ) {
				var done = false;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function(){
					if ( !done && (!this.readyState ||
							this.readyState == "loaded" || this.readyState == "complete") ) {
						done = true;
						success();
						complete();

						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;
						head.removeChild( script );
					}
				};
			}

			head.appendChild(script);

			// We handle everything using the script element injection
			return undefined;
		}

		var requestDone = false;

		// Create the request object
		var xhr = s.xhr();

		// Open the socket
		// Passing null username, generates a login popup on Opera (#2865)
		if( s.username )
			xhr.open(type, s.url, s.async, s.username, s.password);
		else
			xhr.open(type, s.url, s.async);

		// Need an extra try/catch for cross domain requests in Firefox 3
		try {
			// Set the correct header, if data is being sent
			if ( s.data )
				xhr.setRequestHeader("Content-Type", s.contentType);

			// Set the If-Modified-Since header, if ifModified mode.
			if ( s.ifModified )
				xhr.setRequestHeader("If-Modified-Since",
					jQuery.lastModified[s.url] || "Thu, 01 Jan 1970 00:00:00 GMT" );

			// Set header so the called script knows that it's an XMLHttpRequest
			xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

			// Set the Accepts header for the server, depending on the dataType
			xhr.setRequestHeader("Accept", s.dataType && s.accepts[ s.dataType ] ?
				s.accepts[ s.dataType ] + ", */*" :
				s.accepts._default );
		} catch(e){}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && s.beforeSend(xhr, s) === false ) {
			// Handle the global AJAX counter
			if ( s.global && ! --jQuery.active )
				jQuery.event.trigger( "ajaxStop" );
			// close opended socket
			xhr.abort();
			return false;
		}

		if ( s.global )
			jQuery.event.trigger("ajaxSend", [xhr, s]);

		// Wait for a response to come back
		var onreadystatechange = function(isTimeout){
			// The request was aborted, clear the interval and decrement jQuery.active
			if (xhr.readyState == 0) {
				if (ival) {
					// clear poll interval
					clearInterval(ival);
					ival = null;
					// Handle the global AJAX counter
					if ( s.global && ! --jQuery.active )
						jQuery.event.trigger( "ajaxStop" );
				}
			// The transfer is complete and the data is available, or the request timed out
			} else if ( !requestDone && xhr && (xhr.readyState == 4 || isTimeout == "timeout") ) {
				requestDone = true;

				// clear poll interval
				if (ival) {
					clearInterval(ival);
					ival = null;
				}

				status = isTimeout == "timeout" ? "timeout" :
					!jQuery.httpSuccess( xhr ) ? "error" :
					s.ifModified && jQuery.httpNotModified( xhr, s.url ) ? "notmodified" :
					"success";

				if ( status == "success" ) {
					// Watch for, and catch, XML document parse errors
					try {
						// process the data (runs the xml through httpData regardless of callback)
						data = jQuery.httpData( xhr, s.dataType, s );
					} catch(e) {
						status = "parsererror";
					}
				}

				// Make sure that the request was successful or notmodified
				if ( status == "success" ) {
					// Cache Last-Modified header, if ifModified mode.
					var modRes;
					try {
						modRes = xhr.getResponseHeader("Last-Modified");
					} catch(e) {} // swallow exception thrown by FF if header is not available

					if ( s.ifModified && modRes )
						jQuery.lastModified[s.url] = modRes;

					// JSONP handles its own success callback
					if ( !jsonp )
						success();
				} else
					jQuery.handleError(s, xhr, status);

				// Fire the complete handlers
				complete();

				if ( isTimeout )
					xhr.abort();

				// Stop memory leaks
				if ( s.async )
					xhr = null;
			}
		};

		if ( s.async ) {
			// don't attach the handler to the request, just poll it instead
			var ival = setInterval(onreadystatechange, 13);

			// Timeout checker
			if ( s.timeout > 0 )
				setTimeout(function(){
					// Check to see if the request is still happening
					if ( xhr && !requestDone )
						onreadystatechange( "timeout" );
				}, s.timeout);
		}

		// Send the data
		try {
			xhr.send(s.data);
		} catch(e) {
			jQuery.handleError(s, xhr, null, e);
		}

		// firefox 1.5 doesn't fire statechange for sync requests
		if ( !s.async )
			onreadystatechange();

		function success(){
			// If a local callback was specified, fire it and pass it the data
			if ( s.success )
				s.success( data, status );

			// Fire the global callback
			if ( s.global )
				jQuery.event.trigger( "ajaxSuccess", [xhr, s] );
		}

		function complete(){
			// Process result
			if ( s.complete )
				s.complete(xhr, status);

			// The request was completed
			if ( s.global )
				jQuery.event.trigger( "ajaxComplete", [xhr, s] );

			// Handle the global AJAX counter
			if ( s.global && ! --jQuery.active )
				jQuery.event.trigger( "ajaxStop" );
		}

		// return XMLHttpRequest to allow aborting the request etc.
		return xhr;
	},

	handleError: function( s, xhr, status, e ) {
		// If a local callback was specified, fire it
		if ( s.error ) s.error( xhr, status, e );

		// Fire the global callback
		if ( s.global )
			jQuery.event.trigger( "ajaxError", [xhr, s, e] );
	},

	// Counter for holding the number of active queries
	active: 0,

	// Determines if an XMLHttpRequest was successful or not
	httpSuccess: function( xhr ) {
		try {
			// IE error sometimes returns 1223 when it should be 204 so treat it as success, see #1450
			return !xhr.status && location.protocol == "file:" ||
				( xhr.status >= 200 && xhr.status < 300 ) || xhr.status == 304 || xhr.status == 1223;
		} catch(e){}
		return false;
	},

	// Determines if an XMLHttpRequest returns NotModified
	httpNotModified: function( xhr, url ) {
		try {
			var xhrRes = xhr.getResponseHeader("Last-Modified");

			// Firefox always returns 200. check Last-Modified date
			return xhr.status == 304 || xhrRes == jQuery.lastModified[url];
		} catch(e){}
		return false;
	},

	httpData: function( xhr, type, s ) {
		var ct = xhr.getResponseHeader("content-type"),
			xml = type == "xml" || !type && ct && ct.indexOf("xml") >= 0,
			data = xml ? xhr.responseXML : xhr.responseText;

		if ( xml && data.documentElement.tagName == "parsererror" )
			throw "parsererror";
			
		// Allow a pre-filtering function to sanitize the response
		// s != null is checked to keep backwards compatibility
		if( s && s.dataFilter )
			data = s.dataFilter( data, type );

		// The filter can actually parse the response
		if( typeof data === "string" ){

			// If the type is "script", eval it in global context
			if ( type == "script" )
				jQuery.globalEval( data );

			// Get the JavaScript object, if JSON is used.
			if ( type == "json" )
				data = window["eval"]("(" + data + ")");
		}
		
		return data;
	},

	// Serialize an array of form elements or a set of
	// key/values into a query string
	param: function( a ) {
		var s = [ ];

		function add( key, value ){
			s[ s.length ] = encodeURIComponent(key) + '=' + encodeURIComponent(value);
		};

		// If an array was passed in, assume that it is an array
		// of form elements
		if ( jQuery.isArray(a) || a.jquery )
			// Serialize the form elements
			jQuery.each( a, function(){
				add( this.name, this.value );
			});

		// Otherwise, assume that it's an object of key/value pairs
		else
			// Serialize the key/values
			for ( var j in a )
				// If the value is an array then the key names need to be repeated
				if ( jQuery.isArray(a[j]) )
					jQuery.each( a[j], function(){
						add( j, this );
					});
				else
					add( j, jQuery.isFunction(a[j]) ? a[j]() : a[j] );

		// Return the resulting serialization
		return s.join("&").replace(/%20/g, "+");
	}

});
var elemdisplay = {},
	timerId,
	fxAttrs = [
		// height animations
		[ "height", "marginTop", "marginBottom", "paddingTop", "paddingBottom" ],
		// width animations
		[ "width", "marginLeft", "marginRight", "paddingLeft", "paddingRight" ],
		// opacity animations
		[ "opacity" ]
	];

function genFx( type, num ){
	var obj = {};
	jQuery.each( fxAttrs.concat.apply([], fxAttrs.slice(0,num)), function(){
		obj[ this ] = type;
	});
	return obj;
}

jQuery.fn.extend({
	show: function(speed,callback){
		if ( speed ) {
			return this.animate( genFx("show", 3), speed, callback);
		} else {
			for ( var i = 0, l = this.length; i < l; i++ ){
				var old = jQuery.data(this[i], "olddisplay");
				
				this[i].style.display = old || "";
				
				if ( jQuery.css(this[i], "display") === "none" ) {
					var tagName = this[i].tagName, display;
					
					if ( elemdisplay[ tagName ] ) {
						display = elemdisplay[ tagName ];
					} else {
						var elem = jQuery("<" + tagName + " />").appendTo("body");
						
						display = elem.css("display");
						if ( display === "none" )
							display = "block";
						
						elem.remove();
						
						elemdisplay[ tagName ] = display;
					}
					
					jQuery.data(this[i], "olddisplay", display);
				}
			}

			// Set the display of the elements in a second loop
			// to avoid the constant reflow
			for ( var i = 0, l = this.length; i < l; i++ ){
				this[i].style.display = jQuery.data(this[i], "olddisplay") || "";
			}
			
			return this;
		}
	},

	hide: function(speed,callback){
		if ( speed ) {
			return this.animate( genFx("hide", 3), speed, callback);
		} else {
			for ( var i = 0, l = this.length; i < l; i++ ){
				var old = jQuery.data(this[i], "olddisplay");
				if ( !old && old !== "none" )
					jQuery.data(this[i], "olddisplay", jQuery.css(this[i], "display"));
			}

			// Set the display of the elements in a second loop
			// to avoid the constant reflow
			for ( var i = 0, l = this.length; i < l; i++ ){
				this[i].style.display = "none";
			}

			return this;
		}
	},

	// Save the old toggle function
	_toggle: jQuery.fn.toggle,

	toggle: function( fn, fn2 ){
		var bool = typeof fn === "boolean";

		return jQuery.isFunction(fn) && jQuery.isFunction(fn2) ?
			this._toggle.apply( this, arguments ) :
			fn == null || bool ?
				this.each(function(){
					var state = bool ? fn : jQuery(this).is(":hidden");
					jQuery(this)[ state ? "show" : "hide" ]();
				}) :
				this.animate(genFx("toggle", 3), fn, fn2);
	},

	fadeTo: function(speed,to,callback){
		return this.animate({opacity: to}, speed, callback);
	},

	animate: function( prop, speed, easing, callback ) {
		var optall = jQuery.speed(speed, easing, callback);

		return this[ optall.queue === false ? "each" : "queue" ](function(){
		
			var opt = jQuery.extend({}, optall), p,
				hidden = this.nodeType == 1 && jQuery(this).is(":hidden"),
				self = this;
	
			for ( p in prop ) {
				if ( prop[p] == "hide" && hidden || prop[p] == "show" && !hidden )
					return opt.complete.call(this);

				if ( ( p == "height" || p == "width" ) && this.style ) {
					// Store display property
					opt.display = jQuery.css(this, "display");

					// Make sure that nothing sneaks out
					opt.overflow = this.style.overflow;
				}
			}

			if ( opt.overflow != null )
				this.style.overflow = "hidden";

			opt.curAnim = jQuery.extend({}, prop);

			jQuery.each( prop, function(name, val){
				var e = new jQuery.fx( self, opt, name );

				if ( /toggle|show|hide/.test(val) )
					e[ val == "toggle" ? hidden ? "show" : "hide" : val ]( prop );
				else {
					var parts = val.toString().match(/^([+-]=)?([\d+-.]+)(.*)$/),
						start = e.cur(true) || 0;

					if ( parts ) {
						var end = parseFloat(parts[2]),
							unit = parts[3] || "px";

						// We need to compute starting value
						if ( unit != "px" ) {
							self.style[ name ] = (end || 1) + unit;
							start = ((end || 1) / e.cur(true)) * start;
							self.style[ name ] = start + unit;
						}

						// If a +=/-= token was provided, we're doing a relative animation
						if ( parts[1] )
							end = ((parts[1] == "-=" ? -1 : 1) * end) + start;

						e.custom( start, end, unit );
					} else
						e.custom( start, val, "" );
				}
			});

			// For JS strict compliance
			return true;
		});
	},

	stop: function(clearQueue, gotoEnd){
		var timers = jQuery.timers;

		if (clearQueue)
			this.queue([]);

		this.each(function(){
			// go in reverse order so anything added to the queue during the loop is ignored
			for ( var i = timers.length - 1; i >= 0; i-- )
				if ( timers[i].elem == this ) {
					if (gotoEnd)
						// force the next step to be the last
						timers[i](true);
					timers.splice(i, 1);
				}
		});

		// start the next in the queue if the last step wasn't forced
		if (!gotoEnd)
			this.dequeue();

		return this;
	}

});

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx("show", 1),
	slideUp: genFx("hide", 1),
	slideToggle: genFx("toggle", 1),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" }
}, function( name, props ){
	jQuery.fn[ name ] = function( speed, callback ){
		return this.animate( props, speed, callback );
	};
});

jQuery.extend({

	speed: function(speed, easing, fn) {
		var opt = typeof speed === "object" ? speed : {
			complete: fn || !fn && easing ||
				jQuery.isFunction( speed ) && speed,
			duration: speed,
			easing: fn && easing || easing && !jQuery.isFunction(easing) && easing
		};

		opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
			jQuery.fx.speeds[opt.duration] || jQuery.fx.speeds._default;

		// Queueing
		opt.old = opt.complete;
		opt.complete = function(){
			if ( opt.queue !== false )
				jQuery(this).dequeue();
			if ( jQuery.isFunction( opt.old ) )
				opt.old.call( this );
		};

		return opt;
	},

	easing: {
		linear: function( p, n, firstNum, diff ) {
			return firstNum + diff * p;
		},
		swing: function( p, n, firstNum, diff ) {
			return ((-Math.cos(p*Math.PI)/2) + 0.5) * diff + firstNum;
		}
	},

	timers: [],

	fx: function( elem, options, prop ){
		this.options = options;
		this.elem = elem;
		this.prop = prop;

		if ( !options.orig )
			options.orig = {};
	}

});

jQuery.fx.prototype = {

	// Simple function for setting a style value
	update: function(){
		if ( this.options.step )
			this.options.step.call( this.elem, this.now, this );

		(jQuery.fx.step[this.prop] || jQuery.fx.step._default)( this );

		// Set display property to block for height/width animations
		if ( ( this.prop == "height" || this.prop == "width" ) && this.elem.style )
			this.elem.style.display = "block";
	},

	// Get the current size
	cur: function(force){
		if ( this.elem[this.prop] != null && (!this.elem.style || this.elem.style[this.prop] == null) )
			return this.elem[ this.prop ];

		var r = parseFloat(jQuery.css(this.elem, this.prop, force));
		return r && r > -10000 ? r : parseFloat(jQuery.curCSS(this.elem, this.prop)) || 0;
	},

	// Start an animation from one number to another
	custom: function(from, to, unit){
		this.startTime = now();
		this.start = from;
		this.end = to;
		this.unit = unit || this.unit || "px";
		this.now = this.start;
		this.pos = this.state = 0;

		var self = this;
		function t(gotoEnd){
			return self.step(gotoEnd);
		}

		t.elem = this.elem;

		if ( t() && jQuery.timers.push(t) && !timerId ) {
			timerId = setInterval(function(){
				var timers = jQuery.timers;

				for ( var i = 0; i < timers.length; i++ )
					if ( !timers[i]() )
						timers.splice(i--, 1);

				if ( !timers.length ) {
					clearInterval( timerId );
					timerId = undefined;
				}
			}, 13);
		}
	},

	// Simple 'show' function
	show: function(){
		// Remember where we started, so that we can go back to it later
		this.options.orig[this.prop] = jQuery.attr( this.elem.style, this.prop );
		this.options.show = true;

		// Begin the animation
		// Make sure that we start at a small width/height to avoid any
		// flash of content
		this.custom(this.prop == "width" || this.prop == "height" ? 1 : 0, this.cur());

		// Start by showing the element
		jQuery(this.elem).show();
	},

	// Simple 'hide' function
	hide: function(){
		// Remember where we started, so that we can go back to it later
		this.options.orig[this.prop] = jQuery.attr( this.elem.style, this.prop );
		this.options.hide = true;

		// Begin the animation
		this.custom(this.cur(), 0);
	},

	// Each step of an animation
	step: function(gotoEnd){
		var t = now();

		if ( gotoEnd || t >= this.options.duration + this.startTime ) {
			this.now = this.end;
			this.pos = this.state = 1;
			this.update();

			this.options.curAnim[ this.prop ] = true;

			var done = true;
			for ( var i in this.options.curAnim )
				if ( this.options.curAnim[i] !== true )
					done = false;

			if ( done ) {
				if ( this.options.display != null ) {
					// Reset the overflow
					this.elem.style.overflow = this.options.overflow;

					// Reset the display
					this.elem.style.display = this.options.display;
					if ( jQuery.css(this.elem, "display") == "none" )
						this.elem.style.display = "block";
				}

				// Hide the element if the "hide" operation was done
				if ( this.options.hide )
					jQuery(this.elem).hide();

				// Reset the properties, if the item has been hidden or shown
				if ( this.options.hide || this.options.show )
					for ( var p in this.options.curAnim )
						jQuery.attr(this.elem.style, p, this.options.orig[p]);
					
				// Execute the complete function
				this.options.complete.call( this.elem );
			}

			return false;
		} else {
			var n = t - this.startTime;
			this.state = n / this.options.duration;

			// Perform the easing function, defaults to swing
			this.pos = jQuery.easing[this.options.easing || (jQuery.easing.swing ? "swing" : "linear")](this.state, n, 0, 1, this.options.duration);
			this.now = this.start + ((this.end - this.start) * this.pos);

			// Perform the next step of the animation
			this.update();
		}

		return true;
	}

};

jQuery.extend( jQuery.fx, {
	speeds:{
		slow: 600,
 		fast: 200,
 		// Default speed
 		_default: 400
	},
	step: {

		opacity: function(fx){
			jQuery.attr(fx.elem.style, "opacity", fx.now);
		},

		_default: function(fx){
			if ( fx.elem.style && fx.elem.style[ fx.prop ] != null )
				fx.elem.style[ fx.prop ] = fx.now + fx.unit;
			else
				fx.elem[ fx.prop ] = fx.now;
		}
	}
});
if ( document.documentElement["getBoundingClientRect"] )
	jQuery.fn.offset = function() {
		if ( !this[0] ) return { top: 0, left: 0 };
		if ( this[0] === this[0].ownerDocument.body ) return jQuery.offset.bodyOffset( this[0] );
		var box  = this[0].getBoundingClientRect(), doc = this[0].ownerDocument, body = doc.body, docElem = doc.documentElement,
			clientTop = docElem.clientTop || body.clientTop || 0, clientLeft = docElem.clientLeft || body.clientLeft || 0,
			top  = box.top  + (self.pageYOffset || jQuery.boxModel && docElem.scrollTop  || body.scrollTop ) - clientTop,
			left = box.left + (self.pageXOffset || jQuery.boxModel && docElem.scrollLeft || body.scrollLeft) - clientLeft;
		return { top: top, left: left };
	};
else 
	jQuery.fn.offset = function() {
		if ( !this[0] ) return { top: 0, left: 0 };
		if ( this[0] === this[0].ownerDocument.body ) return jQuery.offset.bodyOffset( this[0] );
		jQuery.offset.initialized || jQuery.offset.initialize();

		var elem = this[0], offsetParent = elem.offsetParent, prevOffsetParent = elem,
			doc = elem.ownerDocument, computedStyle, docElem = doc.documentElement,
			body = doc.body, defaultView = doc.defaultView,
			prevComputedStyle = defaultView.getComputedStyle(elem, null),
			top = elem.offsetTop, left = elem.offsetLeft;

		while ( (elem = elem.parentNode) && elem !== body && elem !== docElem ) {
			computedStyle = defaultView.getComputedStyle(elem, null);
			top -= elem.scrollTop, left -= elem.scrollLeft;
			if ( elem === offsetParent ) {
				top += elem.offsetTop, left += elem.offsetLeft;
				if ( jQuery.offset.doesNotAddBorder && !(jQuery.offset.doesAddBorderForTableAndCells && /^t(able|d|h)$/i.test(elem.tagName)) )
					top  += parseInt( computedStyle.borderTopWidth,  10) || 0,
					left += parseInt( computedStyle.borderLeftWidth, 10) || 0;
				prevOffsetParent = offsetParent, offsetParent = elem.offsetParent;
			}
			if ( jQuery.offset.subtractsBorderForOverflowNotVisible && computedStyle.overflow !== "visible" )
				top  += parseInt( computedStyle.borderTopWidth,  10) || 0,
				left += parseInt( computedStyle.borderLeftWidth, 10) || 0;
			prevComputedStyle = computedStyle;
		}

		if ( prevComputedStyle.position === "relative" || prevComputedStyle.position === "static" )
			top  += body.offsetTop,
			left += body.offsetLeft;

		if ( prevComputedStyle.position === "fixed" )
			top  += Math.max(docElem.scrollTop, body.scrollTop),
			left += Math.max(docElem.scrollLeft, body.scrollLeft);

		return { top: top, left: left };
	};

jQuery.offset = {
	initialize: function() {
		if ( this.initialized ) return;
		var body = document.body, container = document.createElement('div'), innerDiv, checkDiv, table, td, rules, prop, bodyMarginTop = body.style.marginTop,
			html = '<div style="position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;"><div></div></div><table style="position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;" cellpadding="0" cellspacing="0"><tr><td></td></tr></table>';

		rules = { position: 'absolute', top: 0, left: 0, margin: 0, border: 0, width: '1px', height: '1px', visibility: 'hidden' };
		for ( prop in rules ) container.style[prop] = rules[prop];

		container.innerHTML = html;
		body.insertBefore(container, body.firstChild);
		innerDiv = container.firstChild, checkDiv = innerDiv.firstChild, td = innerDiv.nextSibling.firstChild.firstChild;

		this.doesNotAddBorder = (checkDiv.offsetTop !== 5);
		this.doesAddBorderForTableAndCells = (td.offsetTop === 5);

		innerDiv.style.overflow = 'hidden', innerDiv.style.position = 'relative';
		this.subtractsBorderForOverflowNotVisible = (checkDiv.offsetTop === -5);

		body.style.marginTop = '1px';
		this.doesNotIncludeMarginInBodyOffset = (body.offsetTop === 0);
		body.style.marginTop = bodyMarginTop;

		body.removeChild(container);
		this.initialized = true;
	},

	bodyOffset: function(body) {
		jQuery.offset.initialized || jQuery.offset.initialize();
		var top = body.offsetTop, left = body.offsetLeft;
		if ( jQuery.offset.doesNotIncludeMarginInBodyOffset )
			top  += parseInt( jQuery.curCSS(body, 'marginTop',  true), 10 ) || 0,
			left += parseInt( jQuery.curCSS(body, 'marginLeft', true), 10 ) || 0;
		return { top: top, left: left };
	}
};


jQuery.fn.extend({
	position: function() {
		var left = 0, top = 0, results;

		if ( this[0] ) {
			// Get *real* offsetParent
			var offsetParent = this.offsetParent(),

			// Get correct offsets
			offset       = this.offset(),
			parentOffset = /^body|html$/i.test(offsetParent[0].tagName) ? { top: 0, left: 0 } : offsetParent.offset();

			// Subtract element margins
			// note: when an element has margin: auto the offsetLeft and marginLeft 
			// are the same in Safari causing offset.left to incorrectly be 0
			offset.top  -= num( this, 'marginTop'  );
			offset.left -= num( this, 'marginLeft' );

			// Add offsetParent borders
			parentOffset.top  += num( offsetParent, 'borderTopWidth'  );
			parentOffset.left += num( offsetParent, 'borderLeftWidth' );

			// Subtract the two offsets
			results = {
				top:  offset.top  - parentOffset.top,
				left: offset.left - parentOffset.left
			};
		}

		return results;
	},

	offsetParent: function() {
		var offsetParent = this[0].offsetParent || document.body;
		while ( offsetParent && (!/^body|html$/i.test(offsetParent.tagName) && jQuery.css(offsetParent, 'position') == 'static') )
			offsetParent = offsetParent.offsetParent;
		return jQuery(offsetParent);
	}
});


// Create scrollLeft and scrollTop methods
jQuery.each( ['Left', 'Top'], function(i, name) {
	var method = 'scroll' + name;
	
	jQuery.fn[ method ] = function(val) {
		if (!this[0]) return null;

		return val !== undefined ?

			// Set the scroll offset
			this.each(function() {
				this == window || this == document ?
					window.scrollTo(
						!i ? val : jQuery(window).scrollLeft(),
						 i ? val : jQuery(window).scrollTop()
					) :
					this[ method ] = val;
			}) :

			// Return the scroll offset
			this[0] == window || this[0] == document ?
				self[ i ? 'pageYOffset' : 'pageXOffset' ] ||
					jQuery.boxModel && document.documentElement[ method ] ||
					document.body[ method ] :
				this[0][ method ];
	};
});
// Create innerHeight, innerWidth, outerHeight and outerWidth methods
jQuery.each([ "Height", "Width" ], function(i, name){

	var tl = i ? "Left"  : "Top",  // top or left
		br = i ? "Right" : "Bottom", // bottom or right
		lower = name.toLowerCase();

	// innerHeight and innerWidth
	jQuery.fn["inner" + name] = function(){
		return this[0] ?
			jQuery.css( this[0], lower, false, "padding" ) :
			null;
	};

	// outerHeight and outerWidth
	jQuery.fn["outer" + name] = function(margin) {
		return this[0] ?
			jQuery.css( this[0], lower, false, margin ? "margin" : "border" ) :
			null;
	};
	
	var type = name.toLowerCase();

	jQuery.fn[ type ] = function( size ) {
		// Get window width or height
		return this[0] == window ?
			// Everyone else use document.documentElement or document.body depending on Quirks vs Standards mode
			document.compatMode == "CSS1Compat" && document.documentElement[ "client" + name ] ||
			document.body[ "client" + name ] :

			// Get document width or height
			this[0] == document ?
				// Either scroll[Width/Height] or offset[Width/Height], whichever is greater
				Math.max(
					document.documentElement["client" + name],
					document.body["scroll" + name], document.documentElement["scroll" + name],
					document.body["offset" + name], document.documentElement["offset" + name]
				) :

				// Get or set width or height on the element
				size === undefined ?
					// Get width or height on the element
					(this.length ? jQuery.css( this[0], type ) : null) :

					// Set the width or height on the element (default to pixels if value is unitless)
					this.css( type, typeof size === "string" ? size : size + "px" );
	};

});
})();
/*
 * jQuery JSON Plugin
 * version: 2.1 (2009-08-14)
 *
 * This document is licensed as free software under the terms of the
 * MIT License: http://www.opensource.org/licenses/mit-license.php
 *
 * Brantley Harris wrote this plugin. It is based somewhat on the JSON.org 
 * website's http://www.json.org/json2.js, which proclaims:
 * "NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.", a sentiment that
 * I uphold.
 *
 * It is also influenced heavily by MochiKit's serializeJSON, which is 
 * copyrighted 2005 by Bob Ippolito.
 */
 
(function($) {
    /** jQuery.toJSON( json-serializble )
        Converts the given argument into a JSON respresentation.

        If an object has a "toJSON" function, that will be used to get the representation.
        Non-integer/string keys are skipped in the object, as are keys that point to a function.

        json-serializble:
            The *thing* to be converted.
     **/
    $.toJSON = function(o)
    {
        if (typeof(JSON) == 'object' && JSON.stringify)
            return JSON.stringify(o);
        
        var type = typeof(o);
    
        if (o === null)
            return "null";
    
        if (type == "undefined")
            return undefined;
        
        if (type == "number" || type == "boolean")
            return o + "";
    
        if (type == "string")
            return $.quoteString(o);
    
        if (type == 'object')
        {
            if (typeof o.toJSON == "function") 
                return $.toJSON( o.toJSON() );
            
            if (o.constructor === Date)
            {
                var month = o.getUTCMonth() + 1;
                if (month < 10) month = '0' + month;

                var day = o.getUTCDate();
                if (day < 10) day = '0' + day;

                var year = o.getUTCFullYear();
                
                var hours = o.getUTCHours();
                if (hours < 10) hours = '0' + hours;
                
                var minutes = o.getUTCMinutes();
                if (minutes < 10) minutes = '0' + minutes;
                
                var seconds = o.getUTCSeconds();
                if (seconds < 10) seconds = '0' + seconds;
                
                var milli = o.getUTCMilliseconds();
                if (milli < 100) milli = '0' + milli;
                if (milli < 10) milli = '0' + milli;

                return '"' + year + '-' + month + '-' + day + 'T' +
                             hours + ':' + minutes + ':' + seconds + 
                             '.' + milli + 'Z"'; 
            }

            if (o.constructor === Array) 
            {
                var ret = [];
                for (var i = 0; i < o.length; i++)
                    ret.push( $.toJSON(o[i]) || "null" );

                return "[" + ret.join(",") + "]";
            }
        
            var pairs = [];
            for (var k in o) {
                var name;
                var type = typeof k;

                if (type == "number")
                    name = '"' + k + '"';
                else if (type == "string")
                    name = $.quoteString(k);
                else
                    continue;  //skip non-string or number keys
            
                if (typeof o[k] == "function") 
                    continue;  //skip pairs where the value is a function.
            
                var val = $.toJSON(o[k]);
            
                pairs.push(name + ":" + val);
            }

            return "{" + pairs.join(", ") + "}";
        }
    };

    /** jQuery.evalJSON(src)
        Evaluates a given piece of json source.
     **/
    $.evalJSON = function(src)
    {
        if (typeof(JSON) == 'object' && JSON.parse)
            return JSON.parse(src);
        return eval("(" + src + ")");
    };
    
    /** jQuery.secureEvalJSON(src)
        Evals JSON in a way that is *more* secure.
    **/
    $.secureEvalJSON = function(src)
    {
        if (typeof(JSON) == 'object' && JSON.parse)
            return JSON.parse(src);
        
        var filtered = src;
        filtered = filtered.replace(/\\["\\\/bfnrtu]/g, '@');
        filtered = filtered.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']');
        filtered = filtered.replace(/(?:^|:|,)(?:\s*\[)+/g, '');
        
        if (/^[\],:{}\s]*$/.test(filtered))
            return eval("(" + src + ")");
        else
            throw new SyntaxError("Error parsing JSON, source is not valid.");
    };

    /** jQuery.quoteString(string)
        Returns a string-repr of a string, escaping quotes intelligently.  
        Mostly a support function for toJSON.
    
        Examples:
            >>> jQuery.quoteString("apple")
            "apple"
        
            >>> jQuery.quoteString('"Where are we going?", she asked.')
            "\"Where are we going?\", she asked."
     **/
    $.quoteString = function(string)
    {
        if (string.match(_escapeable))
        {
            return '"' + string.replace(_escapeable, function (a) 
            {
                var c = _meta[a];
                if (typeof c === 'string') return c;
                c = a.charCodeAt();
                return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
            }) + '"';
        }
        return '"' + string + '"';
    };
    
    var _escapeable = /["\\\x00-\x1f\x7f-\x9f]/g;
    
    var _meta = {
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\\': '\\\\'
    };
})(jQuery);
/*!
 * jQuery UI 1.8.5
 *
 * Copyright 2010, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI
 */
(function( $, undefined ) {

// prevent duplicate loading
// this is only a problem because we proxy existing functions
// and we don't want to double proxy them
$.ui = $.ui || {};
if ( $.ui.version ) {
	return;
}

$.extend( $.ui, {
	version: "1.8.5",

	keyCode: {
		ALT: 18,
		BACKSPACE: 8,
		CAPS_LOCK: 20,
		COMMA: 188,
		COMMAND: 91,
		COMMAND_LEFT: 91, // COMMAND
		COMMAND_RIGHT: 93,
		CONTROL: 17,
		DELETE: 46,
		DOWN: 40,
		END: 35,
		ENTER: 13,
		ESCAPE: 27,
		HOME: 36,
		INSERT: 45,
		LEFT: 37,
		MENU: 93, // COMMAND_RIGHT
		NUMPAD_ADD: 107,
		NUMPAD_DECIMAL: 110,
		NUMPAD_DIVIDE: 111,
		NUMPAD_ENTER: 108,
		NUMPAD_MULTIPLY: 106,
		NUMPAD_SUBTRACT: 109,
		PAGE_DOWN: 34,
		PAGE_UP: 33,
		PERIOD: 190,
		RIGHT: 39,
		SHIFT: 16,
		SPACE: 32,
		TAB: 9,
		UP: 38,
		WINDOWS: 91 // COMMAND
	}
});

// plugins
$.fn.extend({
	_focus: $.fn.focus,
	focus: function( delay, fn ) {
		return typeof delay === "number" ?
			this.each(function() {
				var elem = this;
				setTimeout(function() {
					$( elem ).focus();
					if ( fn ) {
						fn.call( elem );
					}
				}, delay );
			}) :
			this._focus.apply( this, arguments );
	},

	scrollParent: function() {
		var scrollParent;
		if (($.browser.msie && (/(static|relative)/).test(this.css('position'))) || (/absolute/).test(this.css('position'))) {
			scrollParent = this.parents().filter(function() {
				return (/(relative|absolute|fixed)/).test($.curCSS(this,'position',1)) && (/(auto|scroll)/).test($.curCSS(this,'overflow',1)+$.curCSS(this,'overflow-y',1)+$.curCSS(this,'overflow-x',1));
			}).eq(0);
		} else {
			scrollParent = this.parents().filter(function() {
				return (/(auto|scroll)/).test($.curCSS(this,'overflow',1)+$.curCSS(this,'overflow-y',1)+$.curCSS(this,'overflow-x',1));
			}).eq(0);
		}

		return (/fixed/).test(this.css('position')) || !scrollParent.length ? $(document) : scrollParent;
	},

	zIndex: function( zIndex ) {
		if ( zIndex !== undefined ) {
			return this.css( "zIndex", zIndex );
		}

		if ( this.length ) {
			var elem = $( this[ 0 ] ), position, value;
			while ( elem.length && elem[ 0 ] !== document ) {
				// Ignore z-index if position is set to a value where z-index is ignored by the browser
				// This makes behavior of this function consistent across browsers
				// WebKit always returns auto if the element is positioned
				position = elem.css( "position" );
				if ( position === "absolute" || position === "relative" || position === "fixed" ) {
					// IE returns 0 when zIndex is not specified
					// other browsers return a string
					// we ignore the case of nested elements with an explicit value of 0
					// <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
					value = parseInt( elem.css( "zIndex" ) );
					if ( !isNaN( value ) && value != 0 ) {
						return value;
					}
				}
				elem = elem.parent();
			}
		}

		return 0;
	},
	
	disableSelection: function() {
		return this.bind(
			"mousedown.ui-disableSelection selectstart.ui-disableSelection",
			function( event ) {
				event.preventDefault();
			});
	},

	enableSelection: function() {
		return this.unbind( ".ui-disableSelection" );
	}
});

$.each( [ "Width", "Height" ], function( i, name ) {
	var side = name === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
		type = name.toLowerCase(),
		orig = {
			innerWidth: $.fn.innerWidth,
			innerHeight: $.fn.innerHeight,
			outerWidth: $.fn.outerWidth,
			outerHeight: $.fn.outerHeight
		};

	function reduce( elem, size, border, margin ) {
		$.each( side, function() {
			size -= parseFloat( $.curCSS( elem, "padding" + this, true) ) || 0;
			if ( border ) {
				size -= parseFloat( $.curCSS( elem, "border" + this + "Width", true) ) || 0;
			}
			if ( margin ) {
				size -= parseFloat( $.curCSS( elem, "margin" + this, true) ) || 0;
			}
		});
		return size;
	}

	$.fn[ "inner" + name ] = function( size ) {
		if ( size === undefined ) {
			return orig[ "inner" + name ].call( this );
		}

		return this.each(function() {
			$.style( this, type, reduce( this, size ) + "px" );
		});
	};

	$.fn[ "outer" + name] = function( size, margin ) {
		if ( typeof size !== "number" ) {
			return orig[ "outer" + name ].call( this, size );
		}

		return this.each(function() {
			$.style( this, type, reduce( this, size, true, margin ) + "px" );
		});
	};
});

// selectors
function visible( element ) {
	return !$( element ).parents().andSelf().filter(function() {
		return $.curCSS( this, "visibility" ) === "hidden" ||
			$.expr.filters.hidden( this );
	}).length;
}

$.extend( $.expr[ ":" ], {
	data: function( elem, i, match ) {
		return !!$.data( elem, match[ 3 ] );
	},

	focusable: function( element ) {
		var nodeName = element.nodeName.toLowerCase(),
			tabIndex = $.attr( element, "tabindex" );
		if ( "area" === nodeName ) {
			var map = element.parentNode,
				mapName = map.name,
				img;
			if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
				return false;
			}
			img = $( "img[usemap=#" + mapName + "]" )[0];
			return !!img && visible( img );
		}
		return ( /input|select|textarea|button|object/.test( nodeName )
			? !element.disabled
			: "a" == nodeName
				? element.href || !isNaN( tabIndex )
				: !isNaN( tabIndex ))
			// the element and all of its ancestors must be visible
			&& visible( element );
	},

	tabbable: function( element ) {
		var tabIndex = $.attr( element, "tabindex" );
		return ( isNaN( tabIndex ) || tabIndex >= 0 ) && $( element ).is( ":focusable" );
	}
});

// support
$(function() {
	var div = document.createElement( "div" ),
		body = document.body;

	$.extend( div.style, {
		minHeight: "100px",
		height: "auto",
		padding: 0,
		borderWidth: 0
	});

	$.support.minHeight = body.appendChild( div ).offsetHeight === 100;
	// set display to none to avoid a layout bug in IE
	// http://dev.jquery.com/ticket/4014
	body.removeChild( div ).style.display = "none";
});





// deprecated
$.extend( $.ui, {
	// $.ui.plugin is deprecated.  Use the proxy pattern instead.
	plugin: {
		add: function( module, option, set ) {
			var proto = $.ui[ module ].prototype;
			for ( var i in set ) {
				proto.plugins[ i ] = proto.plugins[ i ] || [];
				proto.plugins[ i ].push( [ option, set[ i ] ] );
			}
		},
		call: function( instance, name, args ) {
			var set = instance.plugins[ name ];
			if ( !set || !instance.element[ 0 ].parentNode ) {
				return;
			}
	
			for ( var i = 0; i < set.length; i++ ) {
				if ( instance.options[ set[ i ][ 0 ] ] ) {
					set[ i ][ 1 ].apply( instance.element, args );
				}
			}
		}
	},
	
	// will be deprecated when we switch to jQuery 1.4 - use jQuery.contains()
	contains: function( a, b ) {
		return document.compareDocumentPosition ?
			a.compareDocumentPosition( b ) & 16 :
			a !== b && a.contains( b );
	},
	
	// only used by resizable
	hasScroll: function( el, a ) {
	
		//If overflow is hidden, the element might have extra content, but the user wants to hide it
		if ( $( el ).css( "overflow" ) === "hidden") {
			return false;
		}
	
		var scroll = ( a && a === "left" ) ? "scrollLeft" : "scrollTop",
			has = false;
	
		if ( el[ scroll ] > 0 ) {
			return true;
		}
	
		// TODO: determine which cases actually cause this to happen
		// if the element doesn't have the scroll set, see if it's possible to
		// set the scroll
		el[ scroll ] = 1;
		has = ( el[ scroll ] > 0 );
		el[ scroll ] = 0;
		return has;
	},
	
	// these are odd functions, fix the API or move into individual plugins
	isOverAxis: function( x, reference, size ) {
		//Determines when x coordinate is over "b" element axis
		return ( x > reference ) && ( x < ( reference + size ) );
	},
	isOver: function( y, x, top, left, height, width ) {
		//Determines when x, y coordinates is over "b" element
		return $.ui.isOverAxis( y, top, height ) && $.ui.isOverAxis( x, left, width );
	}
});

})( jQuery );
/*!
 * jQuery UI Widget 1.8.5
 *
 * Copyright 2010, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Widget
 */
(function( $, undefined ) {

// jQuery 1.4+
if ( $.cleanData ) {
	var _cleanData = $.cleanData;
	$.cleanData = function( elems ) {
		for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
			$( elem ).triggerHandler( "remove" );
		}
		_cleanData( elems );
	};
} else {
	var _remove = $.fn.remove;
	$.fn.remove = function( selector, keepData ) {
		return this.each(function() {
			if ( !keepData ) {
				if ( !selector || $.filter( selector, [ this ] ).length ) {
					$( "*", this ).add( [ this ] ).each(function() {
						$( this ).triggerHandler( "remove" );
					});
				}
			}
			return _remove.call( $(this), selector, keepData );
		});
	};
}

$.widget = function( name, base, prototype ) {
	var namespace = name.split( "." )[ 0 ],
		fullName;
	name = name.split( "." )[ 1 ];
	fullName = namespace + "-" + name;

	if ( !prototype ) {
		prototype = base;
		base = $.Widget;
	}

	// create selector for plugin
	$.expr[ ":" ][ fullName ] = function( elem ) {
		return !!$.data( elem, name );
	};

	$[ namespace ] = $[ namespace ] || {};
	$[ namespace ][ name ] = function( options, element ) {
		// allow instantiation without initializing for simple inheritance
		if ( arguments.length ) {
			this._createWidget( options, element );
		}
	};

	var basePrototype = new base();
	// we need to make the options hash a property directly on the new instance
	// otherwise we'll modify the options hash on the prototype that we're
	// inheriting from
//	$.each( basePrototype, function( key, val ) {
//		if ( $.isPlainObject(val) ) {
//			basePrototype[ key ] = $.extend( {}, val );
//		}
//	});
	basePrototype.options = $.extend( true, {}, basePrototype.options );
	$[ namespace ][ name ].prototype = $.extend( true, basePrototype, {
		namespace: namespace,
		widgetName: name,
		widgetEventPrefix: $[ namespace ][ name ].prototype.widgetEventPrefix || name,
		widgetBaseClass: fullName
	}, prototype );

	$.widget.bridge( name, $[ namespace ][ name ] );
};

$.widget.bridge = function( name, object ) {
	$.fn[ name ] = function( options ) {
		var isMethodCall = typeof options === "string",
			args = Array.prototype.slice.call( arguments, 1 ),
			returnValue = this;

		// allow multiple hashes to be passed on init
		options = !isMethodCall && args.length ?
			$.extend.apply( null, [ true, options ].concat(args) ) :
			options;

		// prevent calls to internal methods
		if ( isMethodCall && options.substring( 0, 1 ) === "_" ) {
			return returnValue;
		}

		if ( isMethodCall ) {
			this.each(function() {
				var instance = $.data( this, name );
				if ( !instance ) {
					throw "cannot call methods on " + name + " prior to initialization; " +
						"attempted to call method '" + options + "'";
				}
				if ( !$.isFunction( instance[options] ) ) {
					throw "no such method '" + options + "' for " + name + " widget instance";
				}
				var methodValue = instance[ options ].apply( instance, args );
				if ( methodValue !== instance && methodValue !== undefined ) {
					returnValue = methodValue;
					return false;
				}
			});
		} else {
			this.each(function() {
				var instance = $.data( this, name );
				if ( instance ) {
					instance.option( options || {} )._init();
				} else {
					$.data( this, name, new object( options, this ) );
				}
			});
		}

		return returnValue;
	};
};

$.Widget = function( options, element ) {
	// allow instantiation without initializing for simple inheritance
	if ( arguments.length ) {
		this._createWidget( options, element );
	}
};

$.Widget.prototype = {
	widgetName: "widget",
	widgetEventPrefix: "",
	options: {
		disabled: false
	},
	_createWidget: function( options, element ) {
		// $.widget.bridge stores the plugin instance, but we do it anyway
		// so that it's stored even before the _create function runs
		$.data( element, this.widgetName, this );
		this.element = $( element );
		this.options = $.extend( true, {},
			this.options,
			$.metadata && $.metadata.get( element )[ this.widgetName ],
			options );

		var self = this;
		this.element.bind( "remove." + this.widgetName, function() {
			self.destroy();
		});

		this._create();
		this._init();
	},
	_create: function() {},
	_init: function() {},

	destroy: function() {
		this.element
			.unbind( "." + this.widgetName )
			.removeData( this.widgetName );
		this.widget()
			.unbind( "." + this.widgetName )
			.removeAttr( "aria-disabled" )
			.removeClass(
				this.widgetBaseClass + "-disabled " +
				"ui-state-disabled" );
	},

	widget: function() {
		return this.element;
	},

	option: function( key, value ) {
		var options = key,
			self = this;

		if ( arguments.length === 0 ) {
			// don't return a reference to the internal hash
			return $.extend( {}, self.options );
		}

		if  (typeof key === "string" ) {
			if ( value === undefined ) {
				return this.options[ key ];
			}
			options = {};
			options[ key ] = value;
		}

		$.each( options, function( key, value ) {
			self._setOption( key, value );
		});

		return self;
	},
	_setOption: function( key, value ) {
		this.options[ key ] = value;

		if ( key === "disabled" ) {
			this.widget()
				[ value ? "addClass" : "removeClass"](
					this.widgetBaseClass + "-disabled" + " " +
					"ui-state-disabled" )
				.attr( "aria-disabled", value );
		}

		return this;
	},

	enable: function() {
		return this._setOption( "disabled", false );
	},
	disable: function() {
		return this._setOption( "disabled", true );
	},

	_trigger: function( type, event, data ) {
		var callback = this.options[ type ];

		event = $.Event( event );
		event.type = ( type === this.widgetEventPrefix ?
			type :
			this.widgetEventPrefix + type ).toLowerCase();
		data = data || {};

		// copy original event properties over to the new event
		// this would happen if we could call $.event.fix instead of $.Event
		// but we don't have a way to force an event to be fixed multiple times
		if ( event.originalEvent ) {
			for ( var i = $.event.props.length, prop; i; ) {
				prop = $.event.props[ --i ];
				event[ prop ] = event.originalEvent[ prop ];
			}
		}

		this.element.trigger( event, data );

		return !( $.isFunction(callback) &&
			callback.call( this.element[0], event, data ) === false ||
			event.isDefaultPrevented() );
	}
};

})( jQuery );
/*
 * jQuery UI Position 1.8.5
 *
 * Copyright 2010, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Position
 */
(function( $, undefined ) {

$.ui = $.ui || {};

var horizontalPositions = /left|center|right/,
	verticalPositions = /top|center|bottom/,
	center = "center",
	_position = $.fn.position,
	_offset = $.fn.offset;

$.fn.position = function( options ) {
	if ( !options || !options.of ) {
		return _position.apply( this, arguments );
	}

	// make a copy, we don't want to modify arguments
	options = $.extend( {}, options );

	var target = $( options.of ),
		targetElem = target[0],
		collision = ( options.collision || "flip" ).split( " " ),
		offset = options.offset ? options.offset.split( " " ) : [ 0, 0 ],
		targetWidth,
		targetHeight,
		basePosition;

	if ( targetElem.nodeType === 9 ) {
		targetWidth = target.width();
		targetHeight = target.height();
		basePosition = { top: 0, left: 0 };
	} else if ( targetElem.scrollTo && targetElem.document ) {
		targetWidth = target.width();
		targetHeight = target.height();
		basePosition = { top: target.scrollTop(), left: target.scrollLeft() };
	} else if ( targetElem.preventDefault ) {
		// force left top to allow flipping
		options.at = "left top";
		targetWidth = targetHeight = 0;
		basePosition = { top: options.of.pageY, left: options.of.pageX };
	} else {
		targetWidth = target.outerWidth();
		targetHeight = target.outerHeight();
		basePosition = target.offset();
	}

	// force my and at to have valid horizontal and veritcal positions
	// if a value is missing or invalid, it will be converted to center 
	$.each( [ "my", "at" ], function() {
		var pos = ( options[this] || "" ).split( " " );
		if ( pos.length === 1) {
			pos = horizontalPositions.test( pos[0] ) ?
				pos.concat( [center] ) :
				verticalPositions.test( pos[0] ) ?
					[ center ].concat( pos ) :
					[ center, center ];
		}
		pos[ 0 ] = horizontalPositions.test( pos[0] ) ? pos[ 0 ] : center;
		pos[ 1 ] = verticalPositions.test( pos[1] ) ? pos[ 1 ] : center;
		options[ this ] = pos;
	});

	// normalize collision option
	if ( collision.length === 1 ) {
		collision[ 1 ] = collision[ 0 ];
	}

	// normalize offset option
	offset[ 0 ] = parseInt( offset[0], 10 ) || 0;
	if ( offset.length === 1 ) {
		offset[ 1 ] = offset[ 0 ];
	}
	offset[ 1 ] = parseInt( offset[1], 10 ) || 0;

	if ( options.at[0] === "right" ) {
		basePosition.left += targetWidth;
	} else if (options.at[0] === center ) {
		basePosition.left += targetWidth / 2;
	}

	if ( options.at[1] === "bottom" ) {
		basePosition.top += targetHeight;
	} else if ( options.at[1] === center ) {
		basePosition.top += targetHeight / 2;
	}

	basePosition.left += offset[ 0 ];
	basePosition.top += offset[ 1 ];

	return this.each(function() {
		var elem = $( this ),
			elemWidth = elem.outerWidth(),
			elemHeight = elem.outerHeight(),
			marginLeft = parseInt( $.curCSS( this, "marginLeft", true ) ) || 0,
			marginTop = parseInt( $.curCSS( this, "marginTop", true ) ) || 0,
			collisionWidth = elemWidth + marginLeft +
				parseInt( $.curCSS( this, "marginRight", true ) ) || 0,
			collisionHeight = elemHeight + marginTop +
				parseInt( $.curCSS( this, "marginBottom", true ) ) || 0,
			position = $.extend( {}, basePosition ),
			collisionPosition;

		if ( options.my[0] === "right" ) {
			position.left -= elemWidth;
		} else if ( options.my[0] === center ) {
			position.left -= elemWidth / 2;
		}

		if ( options.my[1] === "bottom" ) {
			position.top -= elemHeight;
		} else if ( options.my[1] === center ) {
			position.top -= elemHeight / 2;
		}

		// prevent fractions (see #5280)
		position.left = parseInt( position.left );
		position.top = parseInt( position.top );

		collisionPosition = {
			left: position.left - marginLeft,
			top: position.top - marginTop
		};

		$.each( [ "left", "top" ], function( i, dir ) {
			if ( $.ui.position[ collision[i] ] ) {
				$.ui.position[ collision[i] ][ dir ]( position, {
					targetWidth: targetWidth,
					targetHeight: targetHeight,
					elemWidth: elemWidth,
					elemHeight: elemHeight,
					collisionPosition: collisionPosition,
					collisionWidth: collisionWidth,
					collisionHeight: collisionHeight,
					offset: offset,
					my: options.my,
					at: options.at
				});
			}
		});

		if ( $.fn.bgiframe ) {
			elem.bgiframe();
		}
		elem.offset( $.extend( position, { using: options.using } ) );
	});
};

$.ui.position = {
	fit: {
		left: function( position, data ) {
			var win = $( window ),
				over = data.collisionPosition.left + data.collisionWidth - win.width() - win.scrollLeft();
			position.left = over > 0 ? position.left - over : Math.max( position.left - data.collisionPosition.left, position.left );
		},
		top: function( position, data ) {
			var win = $( window ),
				over = data.collisionPosition.top + data.collisionHeight - win.height() - win.scrollTop();
			position.top = over > 0 ? position.top - over : Math.max( position.top - data.collisionPosition.top, position.top );
		}
	},

	flip: {
		left: function( position, data ) {
			if ( data.at[0] === center ) {
				return;
			}
			var win = $( window ),
				over = data.collisionPosition.left + data.collisionWidth - win.width() - win.scrollLeft(),
				myOffset = data.my[ 0 ] === "left" ?
					-data.elemWidth :
					data.my[ 0 ] === "right" ?
						data.elemWidth :
						0,
				atOffset = data.at[ 0 ] === "left" ?
					data.targetWidth :
					-data.targetWidth,
				offset = -2 * data.offset[ 0 ];
			position.left += data.collisionPosition.left < 0 ?
				myOffset + atOffset + offset :
				over > 0 ?
					myOffset + atOffset + offset :
					0;
		},
		top: function( position, data ) {
			if ( data.at[1] === center ) {
				return;
			}
			var win = $( window ),
				over = data.collisionPosition.top + data.collisionHeight - win.height() - win.scrollTop(),
				myOffset = data.my[ 1 ] === "top" ?
					-data.elemHeight :
					data.my[ 1 ] === "bottom" ?
						data.elemHeight :
						0,
				atOffset = data.at[ 1 ] === "top" ?
					data.targetHeight :
					-data.targetHeight,
				offset = -2 * data.offset[ 1 ];
			position.top += data.collisionPosition.top < 0 ?
				myOffset + atOffset + offset :
				over > 0 ?
					myOffset + atOffset + offset :
					0;
		}
	}
};

// offset setter from jQuery 1.4
if ( !$.offset.setOffset ) {
	$.offset.setOffset = function( elem, options ) {
		// set position first, in-case top/left are set even on static elem
		if ( /static/.test( $.curCSS( elem, "position" ) ) ) {
			elem.style.position = "relative";
		}
		var curElem   = $( elem ),
			curOffset = curElem.offset(),
			curTop    = parseInt( $.curCSS( elem, "top",  true ), 10 ) || 0,
			curLeft   = parseInt( $.curCSS( elem, "left", true ), 10)  || 0,
			props     = {
				top:  (options.top  - curOffset.top)  + curTop,
				left: (options.left - curOffset.left) + curLeft
			};
		
		if ( 'using' in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	};

	$.fn.offset = function( options ) {
		var elem = this[ 0 ];
		if ( !elem || !elem.ownerDocument ) { return null; }
		if ( options ) { 
			return this.each(function() {
				$.offset.setOffset( this, options );
			});
		}
		return _offset.call( this );
	};
}

}( jQuery ));
/**
 * eXXcellent autocomplete echo-Plugin based on:
 *
 * ---------------------------------------------
 * jQuery UI Autocomplete 1.8.5
 *
 * Copyright 2010, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Autocomplete
 *
 * Depends:
 *    jquery.ui.core.js
 *    jquery.ui.widget.js
 *    jquery.ui.position.js
 * -----------------------------------------------
 *
 * Additional Features
 * - integration in echo3 infrastructure
 * - styling via echo3 Properties
 * - serverFilter with asynchronous behaviour
 *
 * @author Ralf Enderle <r.enderle@exxcellent.de>
 * @version 1.0
 */
(function($, undefined) {


    $.widget("ui.autocomplete", {
        // Styling of suggest
        styling : {
            // will be a merge of default_styling and options.styling
        },
        default_styling : {
            color: 'white',
            suggestAreaColor: 'white',
            suggestAreaHover: '#dadada', // <- a 'grey-like' standard color
            magnifier_img: false, // <- default is false, if you want to have a icon, specify path here
            loading_img: false // <- default is false, if you want to have a icon, specify path here
        },
        options: {
            appendTo: "body",
            delay: 300,
            minLength: 1,
            position: {
                my: "right top",  // <- force to grow from right to left :-)
                at: "right bottom",
                //                my: "left top", // <- this was the default
                //                at: "left bottom",
                collision: "none",
                offset: "0 0"
            },
            source: null,
            styling : null,
            doServerFilter: false
        },
        _create: function() {
            var self = this,
                    doc = this.element[ 0 ].ownerDocument;
            // we merge user-styling(priority) with default-styling to be together in 'styling'
            $.extend(true, this.styling, this.default_styling, this.options.styling);

            var style__ui_autocomplete = {
                'position': 'absolute',
                'cursor': 'default',
                'background': this.styling.suggestAreaColor
            }

            // if there is a bg-color defined by echo we have to set this to the style of the bg-image
            var echoDefinedBGColor = this.element.css('backgroundColor');
            if (!echoDefinedBGColor) {
                echoDefinedBGColor = 'transparent';
            }
            var style__icon = {
                'background': ' url(' + this.styling.magnifier_img + ') right center no-repeat ' + echoDefinedBGColor
            }

            if (this.styling.magnifier_img) {
                // only if we have a specific icon
                this.element.css(style__icon);
            }


            this.element
                    .addClass("ui-autocomplete-input")
                    .attr("autocomplete", "off")
                // TODO verify these actually work as intended
                    .attr({
                              role: "textbox",
                              "aria-autocomplete": "list",
                              "aria-haspopup": "true"
                          })
                    .bind("keydown.autocomplete", function(event) {
                if (self.options.disabled) {
                    return;
                }

                var keyCode = $.ui.keyCode;
                switch (event.keyCode) {
                    case keyCode.PAGE_UP:
                        self._move("previousPage", event);
                        break;
                    case keyCode.PAGE_DOWN:
                        self._move("nextPage", event);
                        break;
                    case keyCode.UP:
                        self._move("previous", event);
                        // prevent moving cursor to beginning of text field in some browsers
                        event.preventDefault();
                        break;
                    case keyCode.DOWN:
                        self._move("next", event);
                        // prevent moving cursor to end of text field in some browsers
                        event.preventDefault();
                        break;
                    case keyCode.ENTER:
                    case keyCode.NUMPAD_ENTER:
                        // when menu is open or has focus
                        if (self.menu.element.is(":visible")) {
                            event.preventDefault();
                        }
                    //passthrough - ENTER and TAB both select the current element
                    case keyCode.TAB:
                        if (!self.menu.active) {
                            return;
                        }
                        self.menu.select(event);
                        break;
                    case keyCode.ESCAPE:
                        if (self.isSuggestBoxVisible) {
                            // if suggestBox is visible, we reSet the value in the inputField to the 'old' one
                            self.element.val(self.term);
                        }
                        // In case of using in Echo we have to trigger the close manually from echo because
                        // there are different strategies in event-handling in Gecko-Engines (like Firefox) and the Internet Explorer
                        // We want to have different ESCAPE-functionality in inside-Echo whether suggestBox is open or not...
                        // so: -> we don't close here ;-)
                        //self.close(event);
                        break;
                    default:
                        // keypress is triggered before the input value is changed
                        clearTimeout(self.searching);
                        self.searching = setTimeout(function() {
                            // only search if the value has changed
                            if (self.term != self.element.val()) {
                                self.selectedItem = null;
                                if (!self.options.doServerFilter) {
                                    // if we have no serverFilter, we trigger a search immediately
                                    self.search(null, event);
                                }
                            }
                        }, self.options.delay);
                        break;
                }
            })
                    .bind("focus.autocomplete", function() {
                if (self.options.disabled) {
                    return;
                }

                self.selectedItem = null;
                self.previous = self.element.val();
            })
                    .bind("blur.autocomplete", function(event) {
                if (self.options.disabled) {
                    return;
                }

                clearTimeout(self.searching);
                // clicks on the menu (or a button to trigger a search) will cause a blur event
                self.closing = setTimeout(function() {
                    self.close(event);
                    self._change(event);
                }, 150);
            });
            this._initSource();
            this.response = function() {
                return self._response.apply(self, arguments);
            };
            this.menu = $("<ul></ul>")
                    .addClass("ui-autocomplete")
                    .css(style__ui_autocomplete)
                    .appendTo($(this.options.appendTo || "body", doc)[0])
                // prevent the close-on-blur in case of a "slow" click on the menu (long mousedown)
                    .mousedown(function(event) {
                // clicking on the scrollbar causes focus to shift to the body
                // but we can't detect a mouseup or a click immediately afterward
                // so we have to track the next mousedown and close the menu if
                // the user clicks somewhere outside of the autocomplete
                var menuElement = self.menu.element[ 0 ];
                if (event.target === menuElement) {
                    setTimeout(function() {
                        $(document).one('mousedown', function(event) {
                            if (event.target !== self.element[ 0 ] &&
                                    event.target !== menuElement &&
                                    !$.ui.contains(menuElement, event.target)) {
                                self.close();
                            }
                        });
                    }, 1);
                }

                // use another timeout to make sure the blur-event-handler on the input was already triggered
                setTimeout(function() {
                    clearTimeout(self.closing);
                }, 13);
            })
                    .menu({
                              focus: function(event, ui) {
                                  var item = ui.item.data("item.autocomplete");
                                  if (false !== self._trigger("focus", null, { item: item })) {
                                      // use value to match what will end up in the input, if it was a key event
                                      if (/^key/.test(event.originalEvent.type)) {
                                          self.element.val(item.value);
                                      }
                                  }
                              },
                              selected: function(event, ui) {
                                  var item = ui.item.data("item.autocomplete"),
                                          previous = self.previous;

                                  // only trigger when focus was lost (click on menu)
                                  if (self.element[0] !== doc.activeElement) {
                                      self.element.focus();
                                      self.previous = previous;
                                  }

                                  if (false !== self._trigger("select", event, { item: item })) {
                                      self.term = item.value;
                                      self.element.val(item.value);
                                  }

                                  self.close(event);
                                  self.selectedItem = item;
                              },
                              blur: function(event, ui) {
                                  // don't set the value of the text field if it's already correct
                                  // this prevents moving the cursor unnecessarily
                                  if (self.menu.element.is(":visible") &&
                                          ( self.element.val() !== self.term )) {
                                      self.element.val(self.term);
                                  }
                              }
                          })
                    .zIndex(this.element.zIndex() + 1)
                // workaround for jQuery bug #5781 http://dev.jquery.com/ticket/5781
                    .css({ top: 0, left: 0 })
                    .hide()
                    .data("menu");
            // we apply the styling to the menu
            this.menu.styleMe(this.options.styling);

            if ($.fn.bgiframe) {
                this.menu.element.bgiframe();
            }
        },

        destroy: function() {
            this.element
                    .removeClass("ui-autocomplete-input")
                    .removeAttr("autocomplete")
                    .removeAttr("role")
                    .removeAttr("aria-autocomplete")
                    .removeAttr("aria-haspopup");
            this.menu.element.remove();
            $.Widget.prototype.destroy.call(this);
        },

        _setOption: function(key, value) {
            $.Widget.prototype._setOption.apply(this, arguments);
            if (key === "source") {
                this._initSource();
            }
            if (key === "appendTo") {
                this.menu.element.appendTo($(value || "body", this.element[0].ownerDocument)[0])
            }
        },
        /**
         * Toggles the LoadingAnimation to on/off
         * @param doLoading
         */
        setLoadingAnimation: function(doLoading) {
            // pick up tzhe actual bg-color to set it to the new styling of the img
            var actualDefinedBGColor = this.element.css('backgroundColor');
            if (!actualDefinedBGColor) {
                actualDefinedBGColor = 'transparent';
            }
            if (doLoading && this.styling.loading_img) {
                var style__icon = {
                    'background': ' url(' + this.styling.loading_img + ') right center no-repeat ' + actualDefinedBGColor
                }
                this.element.css(style__icon);
            } else if (!doLoading && this.styling.magnifier_img) {
                var style__icon = {
                    'background': ' url(' + this.styling.magnifier_img + ') right center no-repeat ' + actualDefinedBGColor
                }
                this.element.css(style__icon);

            }
        },

        _initSource: function() {
            var self = this,
                    array,
                    url;
            if ($.isArray(this.options.source)) {
                array = this.options.source;
                this.source = function(request, response) {
                    response($.ui.autocomplete.filter(array, request.term));
                };
            } else if (typeof this.options.source === "string") {
                url = this.options.source;
                this.source = function(request, response) {
                    if (self.xhr) {
                        self.xhr.abort();
                    }
                    self.xhr = $.getJSON(url, request, function(data, status, xhr) {
                        if (xhr === self.xhr) {
                            response(data);
                        }
                        self.xhr = null;
                    });
                };
            } else {
                this.source = this.options.source;
            }
        },

        search: function(value, event) {
            value = value != null ? value : this.element.val();

            // always save the actual value, not the one passed as an argument
            this.term = this.element.val();

            if (value.length < this.options.minLength) {
                return this.close(event);
            }

            clearTimeout(this.closing);
            if (this._trigger("search") === false) {
                return;
            }

            return this._search(value);
        },

        _search: function(value) {
            this.element.addClass("ui-autocomplete-loading");

            this.source({ term: value }, this.response);
        },

        _response: function(content) {
            if (content.length) {
                content = this._normalize(content);
                this._suggest(content);
                this._trigger("open");
            } else {
                this.close();
            }
            this.element.removeClass("ui-autocomplete-loading");
        },

        close: function(event) {
            clearTimeout(this.closing);
            if (this.menu.element.is(":visible")) {
                this._trigger("close", event);
                this.menu.element.hide();
                this.menu.deactivate();
            }
        },

        _change: function(event) {
            if (this.previous !== this.element.val()) {
                this._trigger("change", event, { item: this.selectedItem });
            }
        },

        _normalize: function(items) {
            // assume all items have the right format when the first item is complete
            if (items.length && items[0].label && items[0].value) {
                return items;
            }
            return $.map(items, function(item) {
                if (typeof item === "string") {
                    return {
                        label: item,
                        value: item
                    };
                }
                return $.extend({
                    label: item.label || item.value,
                    value: item.value || item.label
                }, item);
            });
        },

        _suggest: function(items) {
            var ul = this.menu.element
                    .empty()
                    .zIndex(this.element.zIndex() + 1),
                    menuWidth,
                    textWidth;
            this._renderMenu(ul, items);
            // TODO refresh should check if the active item is still in the dom, removing the need for a manual deactivate
            this.menu.deactivate();
            this.menu.refresh();
            this.menu.element.show().position($.extend({
                of: this.element
            }, this.options.position));

            menuWidth = ul.width("").outerWidth();
            textWidth = this.element.outerWidth();
            //ul.outerWidth(Math.max(menuWidth, textWidth));
        },

        /**
         * not a hack - but maybe a little bit dirty :-)
         * We need this callback to repos the suggestBox from SuggestFieldSync
         */
        repos: function() {
            this.menu.element.show().position($.extend({
                of: this.element
            }, this.options.position));
        },

        /**
         * if you want to know, if the suggestBox is visible at the moment, just ask me :-)
         */
        isSuggestBoxVisible: function() {
            return this.menu.element.is(":visible");
        },

        _renderMenu: function(ul, items) {
            var self = this;
            $.each(items, function(index, item) {
                self._renderItem(ul, item);
            });
        },

        _renderItem: function(ul, item) {
            return $("<li></li>")
                    .data("item.autocomplete", item)
                    .append($("<a></a>").text(item.label))
                    .appendTo(ul);
        },

        _move: function(direction, event) {
            if (!this.menu.element.is(":visible")) {
                this.search(null, event);
                return;
            }
            if (this.menu.first() && /^previous/.test(direction) ||
                    this.menu.last() && /^next/.test(direction)) {
                this.element.val(this.term);
                this.menu.deactivate();
                return;
            }
            this.menu[ direction ](event);
        },

        widget: function() {
            return this.menu.element;
        }
    });

    $.extend($.ui.autocomplete, {
        escapeRegex: function(value) {
            return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        },
        filter: function(array, term) {
            var matcher = new RegExp($.ui.autocomplete.escapeRegex(term), "i");
            return $.grep(array, function(value) {
                return matcher.test(value.label || value.value || value);
            });
        }
    });

}(jQuery));

/*
 * jQuery UI Menu (not officially released)
 * 
 * This widget isn't yet finished and the API is subject to change. We plan to finish
 * it for the next release. You're welcome to give it a try anyway and give us feedback,
 * as long as you're okay with migrating your code later on. We can help with that, too.
 *
 * Copyright 2010, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Menu
 *
 * Depends:
 *	jquery.ui.core.js
 *  jquery.ui.widget.js
 */
(function($) {

    $.widget("ui.menu", {
        styling : {
            // will be a merge of default_styling and options.styling
        },
        default_styling: {
            suggestAreaHover: '#dadada'
        },
        _create: function() {
            var _opacity = 0.9;
            var style__ui_menu = {
                'list-style':'none',
                'padding': '2px',
                'margin': 0,
                'display':'block',
                'float': 'left',
                'opacity': _opacity,'-moz-opacity': _opacity,'filter': 'alpha(opacity=' + _opacity * 100 + ')'  // <- opacity for menu
            }

            var style__ui_widget = {
                'font-family': 'Verdana,Arial,sans-serif',
                'font-size': '1.1em'
            }

            var style__ui_widget_content = {
                'border': '1px solid #aaaaaa'
            }

            var style__ui_corner_all = {
                '-moz-border-radius': '4px',// nice border
                '-webkit-border-radius': '4px',
                'border-radius': '4px',
                '-moz-box-shadow': '2px 2px 1px #000', // and a little drop-shadow
                '-webkit-box-shadow': '2px 2px 1px #000',
                'box-shadow': '2px 2px 1px #000'
            }


            var self = this;

            //this.element.css(style__ui_menu);
            this.element
                    .addClass("ui-menu ui-widget ui-widget-content ui-corner-all")
                    .css(style__ui_menu)
                    .css(style__ui_widget)
                    .css(style__ui_widget_content)
                    .css(style__ui_corner_all)
                    .attr({
                              role: "listbox",
                              "aria-activedescendant": "ui-active-menuitem"
                          })
                    .click(function(event) {
                if (!$(event.target).closest(".ui-menu-item a").length) {
                    return;
                }
                // temporary
                event.preventDefault();
                self.select(event);
            });
            this.refresh();
        },

        refresh: function() {
            var self = this;

            var style__ui_menu_item = {
                'margin':0,
                'padding': 0,
                'zoom': 1,
                'float': 'left',
                'clear': 'left',
                'width': '100%'
            }

            var style__ui_corner_all = {
                '-moz-border-radius': '4px',
                '-webkit-border-radius': '4px',
                'border-radius': '4px'
            }

            var style__ui_menu_item_a = {
                'text-decoration':'none',
                'display':'block',
                'padding':'.2em .4em',
                'line-height':1.5,
                'zoom':1
            }

            // don't refresh list items that are already adapted
            var items = this.element.children("li:not(.ui-menu-item):has(a)")
                    .addClass("ui-menu-item")
                    .css(style__ui_menu_item)
                    .attr("role", "menuitem");

            items.children("a")
                    .addClass("ui-corner-all")
                    .css(style__ui_corner_all).css(style__ui_menu_item_a)
                    .attr("tabindex", -1)
                // mouseenter doesn't work with event delegation
                    .mouseenter(function(event) {
                self.activate(event, $(this).parent());
            })
                    .mouseleave(function() {
                self.deactivate();
            });
        },

        // [TODO: Refactor, this should be available via properties]
        /**
         * Style this component with a userStyling
         *
         * @param userStyling
         */
        styleMe: function(userStyling) {
            $.extend(true, this.styling, this.default_styling, userStyling);
        },

        activate: function(event, item) {
            var style__ui_state_hover = {
                'margin': '-1px',
                'border': '1px solid #999999',
                'background': this.styling.suggestAreaHover // <- we want to style this
            }
            this.deactivate();
            if (this.hasScroll()) {
                var offset = item.offset().top - this.element.offset().top,
                        scroll = this.element.attr("scrollTop"),
                        elementHeight = this.element.height();
                if (offset < 0) {
                    this.element.attr("scrollTop", scroll + offset);
                } else if (offset >= elementHeight) {
                    this.element.attr("scrollTop", scroll + offset - elementHeight + item.height());
                }
            }
            this.active = item.eq(0)
                    .children("a")
                    .addClass("ui-state-hover").css(style__ui_state_hover)
                    .attr("id", "ui-active-menuitem")
                    .end();
            this._trigger("focus", event, { item: item });
        },

        deactivate: function() {
            var style_remove__ui_state_hover = {
                'margin': '0px',
                'border': 'none',
                'background': 'transparent'
            }
            if (!this.active) {
                return;
            }

            this.active.children("a")
                    .removeClass("ui-state-hover")
                    .css(style_remove__ui_state_hover)
                    .removeAttr("id");
            this._trigger("blur");
            this.active = null;
        },

        next: function(event) {
            this.move("next", ".ui-menu-item:first", event);
        },

        previous: function(event) {
            this.move("prev", ".ui-menu-item:last", event);
        },

        first: function() {
            return this.active && !this.active.prevAll(".ui-menu-item").length;
        },

        last: function() {
            return this.active && !this.active.nextAll(".ui-menu-item").length;
        },

        move: function(direction, edge, event) {
            if (!this.active) {
                this.activate(event, this.element.children(edge));
                return;
            }
            var next = this.active[direction + "All"](".ui-menu-item").eq(0);
            if (next.length) {
                this.activate(event, next);
            } else {
                this.activate(event, this.element.children(edge));
            }
        },

        // TODO merge with previousPage
        nextPage: function(event) {
            if (this.hasScroll()) {
                // TODO merge with no-scroll-else
                if (!this.active || this.last()) {
                    this.activate(event, this.element.children(":first"));
                    return;
                }
                var base = this.active.offset().top,
                        height = this.element.height(),
                        result = this.element.children("li").filter(function() {
                            var close = $(this).offset().top - base - height + $(this).height();
                            // TODO improve approximation
                            return close < 10 && close > -10;
                        });

                // TODO try to catch this earlier when scrollTop indicates the last page anyway
                if (!result.length) {
                    result = this.element.children(":last");
                }
                this.activate(event, result);
            } else {
                this.activate(event, this.element.children(!this.active || this.last() ? ":first" : ":last"));
            }
        },

        // TODO merge with nextPage
        previousPage: function(event) {
            if (this.hasScroll()) {
                // TODO merge with no-scroll-else
                if (!this.active || this.first()) {
                    this.activate(event, this.element.children(":last"));
                    return;
                }

                var base = this.active.offset().top,
                        height = this.element.height();
                result = this.element.children("li").filter(function() {
                    var close = $(this).offset().top - base + height - $(this).height();
                    // TODO improve approximation
                    return close < 10 && close > -10;
                });

                // TODO try to catch this earlier when scrollTop indicates the last page anyway
                if (!result.length) {
                    result = this.element.children(":first");
                }
                this.activate(event, result);
            } else {
                this.activate(event, this.element.children(!this.active || this.first() ? ":last" : ":first"));
            }
        },

        hasScroll: function() {
            return this.element.height() < this.element.attr("scrollHeight");
        },

        select: function(event) {
            this._trigger("selected", event, { item: this.active });
        }
    });

}(jQuery));
/**
 *
 * Date picker
 * Author: Stefan Petre www.eyecon.ro
 * 
 * Modified by exxcellent Solutions GmbH, Ulm
 * Author: Oliver Pehnke
 * 
 * Dual licensed under the MIT and GPL licenses
 * 
 */                                         
(function($) {

	$.addPicker = function(t,options)
    {
        if (t.picker) return false; //return if already exist

        // apply default properties
        options = $.extend({
            flat: false, // do not popup, but always show the calendar
            starts: 1, // the first day of the week, Sunday = 0
            prev: '&lt;', // avoid missing unicode glyphs: '&#9664;', // the nice left arrow
            next: '&gt;', // avoid missing unicode glyphs: '&#9654;', // the nice right arrow
            mode: 'single',// the selection mode. Either single or range
            view: 'days', // the initial view. Can be days, months or years
            calendars: 1, // the amount of visible calendars
            format: 'Y-m-d', // search for 'DateFormat', to see the rules
            position: 'bottom', // location where to popup relative to the input field
            owner: false, // the owner of the datepicker component is used as 'this' for all callbacks
            onRender: function(){return {};}, // callback while rendering
            onChange: false, // callback if date was changed
            onShow: false, // callback when calendar is shown
            onBeforeShow: false, // callback before calendar is shown
            onHide: false, // callback on hiding the calendar
            hideOnSelect: true, // hiding the datepicker on selection of a date
            locale: { // the default locale
                days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
                months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                weekMin: 'wk'
            }
        }, options);

        var d = {
            // a date representing the selected date
            current : null,
            date : null,

            lastSel : null,
            calendars : null,
            mode : null,
            gDiv : null,
            lastSelTime : new Date().valueOf(), // dirty workaround to manage tab press & focuslost vs. selection clicks

            // the cache for the "parsed" template
            templateCache: null,
            views : null,
            template : null,

            // if the picker is event processing (used to prevent closing on clickHide() )
            processing : false,

			// Method to actually render the calendar.
			fill : function() {
                var cal = $(this.gDiv);
                var currentCal = Math.floor(options.calendars/2);
                var tmp, dow, month, cnt = 0,
                        week, days, indic, indic2, html, tblCal;

                cal.find('td>table tbody').remove();
				for (var i = 0; i < options.calendars; i++) {
                    tmp = new Date(this.current);
					this.addMonths(tmp, -currentCal + i);

                    tblCal = cal.find('table').eq(i+1);
					switch (tblCal[0].className) {
						case 'datepickerViewDays':
							dow = this.formatDate(tmp, 'B, yyyy');
							break;
						case 'datepickerViewMonths':
							dow = tmp.getFullYear();
							break;
						case 'datepickerViewYears':
							dow = (tmp.getFullYear()-6) + ' - ' + (tmp.getFullYear()+5);
							break;
					};
					tblCal.find('thead tr:first th:eq(1) span').text(dow);
					dow = tmp.getFullYear()-6;
					var yearData = {
						data: [],
						className: 'datepickerYears'
					};
					for ( var j = 0; j < 12; j++) {
						yearData.data.push(dow + j);
					}
					html = this.tmpl(this.template.months.join(''), yearData);
					tmp.setDate(1);
					var weekData = {
                        weeks:[],
                        test: 10
                    };
					month = tmp.getMonth();
					dow = (tmp.getDay() - options.starts) % 7;
					this.addDays(tmp,-(dow + (dow < 0 ? 7 : 0)));
					week = -1;
					cnt = 0;
					while (cnt < 42) {
						indic = parseInt(cnt/7,10);
						indic2 = cnt%7;
						if (!weekData.weeks[indic]) {
							week = this.getWeekNumber(tmp);
                            var elementDays = {
								week: week,
								days: []
							};
							weekData.weeks[indic] = elementDays;
						}
                        var element = {
                            text: tmp.getDate(),
							classname: []
						};
						weekData.weeks[indic].days[indic2] = element;

                        // define the classes, e.g. not in month, sunday and saturday
                        if (month != tmp.getMonth()) {
							weekData.weeks[indic].days[indic2].classname.push('datepickerNotInMonth');
						}
						if (tmp.getDay() === 0) {
							weekData.weeks[indic].days[indic2].classname.push('datepickerSunday');
						}
						if (tmp.getDay() === 6) {
							weekData.weeks[indic].days[indic2].classname.push('datepickerSaturday');
						}
                        // either user defined object or {}
                        var fromUser = options.onRender(tmp);
                        var val = tmp.valueOf();

                        // define the classes, e.g. selected (blue), disabled and user defined dates
                        if (fromUser.selected
                                || this.date === val
                                || $.inArray(val, this.date) > -1
                                || (options.mode === 'range' && this.date[0] && val >= this.date[0] && val <= this.date[1])) {
                            weekData.weeks[indic].days[indic2].classname.push('datepickerSelected');
                        }
                        if (fromUser.disabled) {
                            weekData.weeks[indic].days[indic2].classname.push('datepickerDisabled');
                        }
                        if (fromUser.className) {
                            weekData.weeks[indic].days[indic2].classname.push(fromUser.className);
                        }
						weekData.weeks[indic].days[indic2].classname = weekData.weeks[indic].days[indic2].classname.join(' ');
						cnt++;
						this.addDays(tmp, 1);
					}
					html = this.tmpl(this.template.days.join(''), weekData) + html;
					var monthData = {
						data: options.locale.monthsShort,
						className: 'datepickerMonths'
					};
					html = this.tmpl(this.template.months.join(''), monthData) + html;
					tblCal.append(html);
				}
			},
			// DateFormat -> from String to Date
			parseDate : function (date, format) {
				if (date.constructor == Date) {
					return new Date(date);
				}
				// split the date at anything that is NOT a digit or underscore or char: /\W+/
				var parts = date.split(/\W+/);
				var against = format.split(/\W+/);
				var d, m, y;
				for (var i = 0; i < parts.length; i++) {
					switch (against[i]) {
						case 'd':
						case 'dd':
							d = parseInt(parts[i],10);
							break;
						case 'M':
						case 'MM':
                            // valid values range from 0 - 11    
							m = parseInt(parts[i], 10)-1;
							break;
						case 'yyyy':
						case 'yy':
							y = parseInt(parts[i], 10);
							y += y > 100 ? 0 : (y < 29 ? 2000 : 1900);
							break;
					}
				}
				var now = new Date();// default values.
                var enteredDate = new Date(
                    //y === undefined ? now.getFullYear() : y,
                        (isNaN(y) || y < 1900 || y > 2100) ? now.getFullYear() : y,
                        (isNaN(m) || m < 0 || m > 11) ? now.getMonth() : m,
                        (isNaN(d) || d < 0 || d > 31) ? now.getDate() : d,
                        5, 0, 0 // hours, minutes, seconds
                        );
                return isNaN(enteredDate.valueOf()) ? now : enteredDate ;
			},

			// DateFormat -> from Date to String
			formatDate : function(date, format) {
				var m = date.getMonth();
				var d = date.getDate();
				var y = date.getFullYear(date);
				var wn = this.getWeekNumber(date);

				// get the delimiter value, e.g. '.'
				var delimiter = format.match(/\W+/);
				// split the date at anything that is NOT a digit or underscore or char: /\W+/
				var parts = format.split(/\W+/), part;
				for ( var i = 0; i < parts.length; i++ ) {
					part = parts[i];
					switch (parts[i]) {
						case 'a':
							part = this.getDayName(date);
							break;
						case 'A':
							part = this.getDayName(date,true);
							break;
						case 'b':
							part = this.getMonthName(date);
							break;
						case 'B':
							part = this.getMonthName(date,true);
							break;
						case 'dd':
							part = (d < 10) ? ("0" + d) : d;
							break;
						case 'd':
							part = d;
							break;
						case 'MM':
							part = (m < 9) ? ("0" + (1+m)) : (1+m);
							break;
						case 'M':
							part = m;
							break;
						case 'yy':
							part = ('' + y).substr(2, 2);
							break;
						case 'yyyy':
							part = y;
							break;
					}
					parts[i] = part;
				}
				return parts.join(delimiter);
			},
			layout : function (el) {
				var cal = $(this.gDiv);
				if (!options.extraHeight) {
					var divs = $(el).find('div');
					options.extraHeight = divs.get(0).offsetHeight + divs.get(1).offsetHeight;
					options.extraWidth = divs.get(2).offsetWidth + divs.get(3).offsetWidth;
				}
				var tbl = cal.find('table:first').get(0);
				var width = tbl.offsetWidth;
				var height = tbl.offsetHeight;
				cal.css({
					width: width + options.extraWidth + 'px',
					height: height + options.extraHeight + 'px'
				}).find('div.datepickerContainer').css({
					width: width + 'px',
					height: height + 'px'
				});
			},

            // The main function if the user clicked an element in the calendar div
            selectElement : function(el) {
                this.lastSelTime = new Date(); // dirty workaround: record last click time in calendar
                if (window.console && window.console.log) { window.console.log('DatePicker.selectElement(' + el+' ), id: '+this.gDiv.id); }
                if (el.is('a')) {
					if (el.hasClass('datepickerDisabled')) {
						return false;
					}
					var parentEl = el.parent();
					var tblEl = parentEl.parent().parent().parent();

                    var table = tblEl.get(0);
					var tblIndex = $('table', this.gDiv).index(table) - 1;

                    var tmp = new Date(this.current);
					var changed = false;
					var fillIt = false;

					//Clicks in the calendar header (th) of the table.
					if (parentEl.is('th')) {

						//Weekday click-event. Only applied for mode=='range'
						if (parentEl.hasClass('datepickerWeek') && options.mode == 'range' && !parentEl.next().hasClass('datepickerDisabled')) {
							var val = parseInt(parentEl.next().text(), 10);
							this.addMonths(tmp, tblIndex - Math.floor(options.calendars/2));
							if (parentEl.next().hasClass('datepickerNotInMonth')) {
								this.addMonths(tmp, val > 15 ? -1 : 1);
							}
							tmp.setDate(val);
							this.date[0] = (tmp.setHours(0,0,0,0)).valueOf();
							tmp.setHours(23,59,59,0);
							this.addDays(tmp,6);
							this.date[1] = tmp.valueOf();
							fillIt = true;
							changed = true;
							this.lastSel = false;

						// Month click-event.
						} else if (parentEl.hasClass('datepickerMonth')) {
							this.addMonths(tmp, tblIndex - Math.floor(options.calendars/2));
							switch (table.className) {
								case 'datepickerViewDays':
									table.className = 'datepickerViewMonths';
									el.find('span').text(tmp.getFullYear());
									break;
								case 'datepickerViewMonths':
									table.className = 'datepickerViewYears';
									el.find('span').text((tmp.getFullYear()-6) + ' - ' + (tmp.getFullYear()+5));
									break;
								case 'datepickerViewYears':
									table.className = 'datepickerViewDays';
									el.find('span').text(this.formatDate(tmp, 'B, yyyy'));
									break;
							}

						// Prev and Next for rolling years or month - click-event.
						} else if (parentEl.parent().parent().is('thead')) {
							switch (table.className) {
								case 'datepickerViewDays':
									this.addMonths(this.current, parentEl.hasClass('datepickerGoPrev') ? -1 : 1);
									break;
								case 'datepickerViewMonths':
									this.addYears(this.current, parentEl.hasClass('datepickerGoPrev') ? -1 : 1);
									break;
								case 'datepickerViewYears':
									this.addYears(this.current, parentEl.hasClass('datepickerGoPrev') ? -12 : 12);
									break;
							}
							fillIt = true;
						}

					// Click in the table itself on table data (td), e.g. date iteself
					} else if (parentEl.is('td') && !parentEl.hasClass('datepickerDisabled')) {
						switch (table.className) {

							//Clicking a month in the month view.
							case 'datepickerViewMonths':
								this.current.setMonth(tblEl.find('tbody.datepickerMonths td').index(parentEl));
								this.current.setFullYear(parseInt(tblEl.find('thead th.datepickerMonth span').text(), 10));
								this.addMonths(this.current, Math.floor(options.calendars/2) - tblIndex);
								table.className = 'datepickerViewDays';
								break;

							//Clicking a year in the years view.
							case 'datepickerViewYears':
								this.current.setFullYear(parseInt(el.text(), 10));
								table.className = 'datepickerViewMonths';
								break;

							// Clicking a date in the (normal) date calendar view.
							default:
								var day = parseInt(el.text(), 10);
								this.addMonths(tmp, tblIndex - Math.floor(options.calendars/2));
								if (parentEl.hasClass('datepickerNotInMonth')) {
									this.addMonths(tmp, day > 15 ? -1 : 1);
								}
								tmp.setDate(day);
								switch (options.mode) {
									case 'multiple':
										day = (tmp.setHours(0,0,0,0));
										if ($.inArray(day, this.date) > -1) {
											$.each(this.date, function(nr, dat){
												if (dat == day) {
													this.date.splice(nr,1);
													return false;
												}
											});
										} else {
											this.date.push(day);
										}
										break;
									case 'range':
										if (!this.lastSel) {
											this.date[0] = (tmp.setHours(0,0,0,0)).valueOf();
										}
										day = (tmp.setHours(23,59,59,0)).valueOf();
										if (day < this.date[0]) {
											this.date[1] = this.date[0] + 86399000;
											this.date[0] = day - 86399000;
										} else {
											this.date[1] = day;
										}
										this.lastSel = !this.lastSel;
										break;
									default:
										this.date = tmp.valueOf();
                                        d.processing = false; // we are really ready
										break;
								}
								changed = true;
                                break;
						}
						fillIt = true;
					}
					if (fillIt) {
						this.fill();
					}
					if (changed) {
						// Trigger the onChange() callBack only if the date was really changed.
						// You can also click and select a year or month without changing the
						// date.
                        if(options.onChange) {
						    options.onChange.apply(options.owner, this.prepareDate(options));
                        }
					}
				}
                // help the gc do its job
                tmp = null;
			},
			prepareDate : function (options) {
				var tmp;
				if (options.mode == 'single') {
					tmp = new Date(this.date);
					return [this.formatDate(tmp, options.format), tmp, t];
				} else {
					tmp = [[],[], options.el];
                    var that = this;
					$.each(this.date, function(nr, val){
						var date = new Date(val);
						tmp[0].push(that.formatDate(date, options.format));
						tmp[1].push(date);
					});
					return tmp;
				}
			},
			getViewport : function () {
				var m = document.compatMode == 'CSS1Compat';
				return {
					l : window.pageXOffset || (m ? document.documentElement.scrollLeft : document.body.scrollLeft),
					t : window.pageYOffset || (m ? document.documentElement.scrollTop : document.body.scrollTop),
					w : window.innerWidth || (m ? document.documentElement.clientWidth : document.body.clientWidth),
					h : window.innerHeight || (m ? document.documentElement.clientHeight : document.body.clientHeight)
				};
			},

			showCalendar : function (inputfield) {
                var cal = $(this.gDiv);

				if (cal.is(':hidden') && !t.readOnly) {
					// Sync the value of the input field to the calendar widget
					if (t.value) {
						//this.current = this.parseDate(t.value, options.format);
                        //d.initDate(t.value);
                        d.setPickerDate(t.value);
					}
					// Trigger the callback before showing.
                    if (options.onBeforeShow) {
					    options.onBeforeShow.apply(options.owner, [this.gDiv]);
                    }
                    var pos = $(inputfield).position();
                    var top = pos.top;
                    var left = pos.left;

					//populate the calendar and show the date.
					this.fill();

                    var oldDisplay = $.curCSS(this.gDiv, 'display');
					cal.css({
						visibility: 'hidden',
						display: 'block'
					});

					this.layout(this.gDiv);
                    switch (options.position){
                        case 'top':
                            top -= inputfield.offsetHeight;
                            break;
                        case 'left':
                            left -= inputfield.offsetWidth;
                            break;
                        case 'right':
                            left += inputfield.offsetWidth;
                            break;
                        case 'bottom':
                            top += inputfield.offsetHeight;
                            break;
                        case 'bottom-left':
                            top += inputfield.offsetHeight;
                            left -= cal.outerWidth() - inputfield.offsetWidth;
                            break;
                    }

					cal.css({
						visibility: 'visible',
						display: 'block',
                        top: top + 'px',
                        left: left + 'px',
                        position: 'absolute'
					});
					if (options.onShow) {
                        options.onShow.apply(options.owner, [this.gDiv]);
					}
                    this.gDiv.style.display = "block";
				}
				return false;
			},
			hide : function () {
                if ($(this.gDiv).is(":hidden")){
                    return;
                }
				if (window.console && window.console.log) { window.console.log('DatePicker.hide()'); }
                if (options.onHide) {
                    options.onHide.apply(options.owner);
                }
                this.gDiv.style.display = "none";
                return true;
			},

			// Method to control the focus of the DatePicker Window.
			// @param focusState if true, the datePicker will be focused, otherwise blurred (hidden)
			focusPicker : function (focusState, inputfield) {
                if (window.console && window.console.log) { window.console.log('DatePicker.focusPicker(' + focusState+' ), id: '+this.gDiv.id); }
                if (focusState) {
                    this.showCalendar(inputfield);
                    $(this.gDiv).focus();
                } else {
                    this.hide();
                }
			},

            setPickerDate : function (date, shiftTo) {
                 // initialize date (from inputField.value)
                  if (date) {
				      this.current = this.parseDate(date, options.format);
                  } else {
                      this.current = new Date();
                  }
                  /*this.current.setDate(1);*/
                  this.current.setHours(0,0,0,0);

                this.date = date;

                if (this.date.constructor == String) {
                    this.date = this.parseDate(this.date, options.format);
                    this.date.setHours(0,0,0,0);
                }
                if (options.mode != 'single') {
                    if (this.date != Array) {
                        this.date = [new Date(this.date.valueOf())];
                        if (options.mode == 'range') {
                            this.date.push(new Date(((new Date(this.date[0])).setHours(23,59,59,0)).valueOf()));
                        }
                    } else {
                        for (var i = 0; i < this.date.length; i++) {
                            this.date[i] = new Date((this.parseDate(this.date[i], options.format).setHours(0,0,0,0)).valueOf());
                        }
                        if (options.mode == 'range') {
                            this.date[1] = new Date(((new Date(this.date[1])).setHours(23,59,59,0)).valueOf());
                        }
                    }
                } else {
                    this.date = this.date.valueOf();
                }
                if (shiftTo) {
                    this.current = new Date (options.mode != 'single' ? this.date[0] : this.date);
                }
                //this.fill();
            },

            getPickerDate : function (isFormated) {
                if (this.size() > 0) {
                    return this.prepareDate(options)[isFormated ? 0 : 1];
                }
            },

            clearPicker : function () {
                if (options.mode != 'single') {
                    this.date = [];
                    this.fill();
                }
            },

            tmpl : function (str, data) {
                // Figure out if we're getting a template, or if we need to
                // load the template - and be sure to cache the result.
                var fn = !/\W/.test(str) ?
                  this.templateCache[str] = this.templateCache[str] || this.tmpl(document.getElementById(str).innerHTML) :

                  // Generate a reusable function that will serve as a template
                  // generator (and which will be cached).
                  new Function("obj",
                    "var p=[],print=function(){p.push.apply(p,arguments);};" +

                    // Introduce the data as local variables using with(){}
                    "with(obj){p.push('" +

                    // Convert the template into pure JavaScript
                    str
                      .replace(/[\r\t\n]/g, " ")
                      .split("<%").join("\t")
                      .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                      .replace(/\t=(.*?)%>/g, "',$1,'")
                      .split("\t").join("');")
                      .split("%>").join("p.push('")
                      .split("\r").join("\\'")
                  + "');}return p.join('');");

                // Provide some basic currying to the user
                return data ? fn( data ) : fn;
              },

              getHtml : function(tpl) {
                    var html = '';
                    for (var i = 0; i < options.calendars; i++) {
                        var cnt = options.starts;
                        if (i > 0) {
                            html += tpl.space;
                        }
                        var elements = {
                            week: options.locale.weekMin,
                            prev: options.prev,
                            next: options.next,
                            day1: options.locale.daysMin[(cnt++)%7],
                            day2: options.locale.daysMin[(cnt++)%7],
                            day3: options.locale.daysMin[(cnt++)%7],
                            day4: options.locale.daysMin[(cnt++)%7],
                            day5: options.locale.daysMin[(cnt++)%7],
                            day6: options.locale.daysMin[(cnt++)%7],
                            day7: options.locale.daysMin[(cnt++)%7]
                        };
                        html += this.tmpl(tpl.head.join(''), elements);
                    }
                    return html;
              },
               /**
                * Methods to handle localised date attributes from options.locale
                * and utility methods to manipulate a given date, e.g. addMonth(count).
                * Originally it was Date.prototype but was recoded as closure.
                */
                getMonthName : function (date, fullName) {
                    if (fullName) {
                        return options.locale.months[date.getMonth()];
                    } else {
                        return options.locale.monthsShort[date.getMonth()];
                    }
                },

                getDayName : function (date, fullName) {
                    if (fullName) {
                        return options.locale.days[date.getDay()];
                    } else {
                        return options.locale.daysShort[date.getDay()];
                    }
                },
                addDays : function (date, n) {
                    date.setDate(date.getDate() + n);
                },
                addMonths : function (date, n) {
                    var tmpDate = new Date(date);
                    date.setDate(1);
                    date.setMonth(date.getMonth() + n);
                    date.setDate(Math.min(tmpDate.getDate(), this.getMaxDays(date)));
                },
                addYears : function (date, n) {
                    var tmpDate = new Date(date);

                    date.setDate(1);
                    date.setFullYear(date.getFullYear() + n);
                    date.setDate(Math.min(tmpDate.getDate(), this.getMaxDays(date))); // date.setDate(Math.min(tmpDate, this.getMaxDays(date)));
                },
                getMaxDays : function (date) {
                    var tmpDate = new Date(Date.parse(date, 10)), d = 28, m;
                    m = tmpDate.getMonth();
                    d = 28;
                    while (tmpDate.getMonth() == m) {
                        d ++;
                        tmpDate.setDate(d);
                    }
                    return d - 1;
                },
                getFirstDay : function (date) {
                    var tmpDate = new Date(Date.parse(date, 10));
                    tmpDate.setDate(1);
                    return tmpDate.getDay();
                },
                getWeekNumber : function (date) {
                    var tempDate = new Date(date);
                    tempDate.setDate(tempDate.getDate() - (tempDate.getDay() + 6) % 7 + 3);
                    var dms = tempDate.valueOf();
                    tempDate.setMonth(0);
                    tempDate.setDate(4);
                    return Math.round((dms - tempDate.valueOf()) / (604800000)) + 1;
                },
                getDayOfYear : function (date) {
                    var now = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
                    var then = new Date(date.getFullYear(), 0, 0, 0, 0, 0);
                    var time = now - then;
                    return Math.floor(time / 24*60*60*1000);
                },

              init : function(p) {
                  this.calendars = Math.max(1, parseInt(p.calendars,10)||1);
                  this.mode = /single|multiple|range/.test(p.mode) ? p.mode : 'single';

                  //d.initDate(t.value);
                  d.setPickerDate(t.value);

                  d.templateCache = {};

                  d.views = {
                        years: 'datepickerViewYears',
                        moths: 'datepickerViewMonths',
                        days: 'datepickerViewDays'
                    };
                  d.template = {
                        wrapper: '<div class="datepicker"><div class="datepickerBorderT" /><div class="datepickerBorderB" /><div class="datepickerBorderL" /><div class="datepickerBorderR" /><div class="datepickerBorderTL" /><div class="datepickerBorderTR" /><div class="datepickerBorderBL" /><div class="datepickerBorderBR" /><div class="datepickerContainer"><table cellspacing="0" cellpadding="0"><tbody><tr></tr></tbody></table></div></div>',
                        head: [
                            '<td>',
                            '<table cellspacing="0" cellpadding="0">',
                                '<thead>',
                                    '<tr>',
                                        '<th class="datepickerGoPrev"><a href="#"><span><%=prev%></span></a></th>',
                                        '<th colspan="6" class="datepickerMonth"><a href="#"><span></span></a></th>',
                                        '<th class="datepickerGoNext"><a href="#"><span><%=next%></span></a></th>',
                                    '</tr>',
                                    '<tr class="datepickerDoW">',
                                        '<th><span><%=week%></span></th>',
                                        '<th><span><%=day1%></span></th>',
                                        '<th><span><%=day2%></span></th>',
                                        '<th><span><%=day3%></span></th>',
                                        '<th><span><%=day4%></span></th>',
                                        '<th><span><%=day5%></span></th>',
                                        '<th><span><%=day6%></span></th>',
                                        '<th><span><%=day7%></span></th>',
                                    '</tr>',
                                '</thead>',
                            '</table></td>'
                        ],
                        space : '<td class="datepickerSpace"><div></div></td>',
                        days: [
                            '<tbody class="datepickerDays">',
                                '<tr>',
                                    '<th class="datepickerWeek"><a href="#"><span><%=weeks[0].week%></span></a></th>',
                                    '<td class="<%=weeks[0].days[0].classname%>"><a href="#"><span><%=weeks[0].days[0].text%></span></a></td>',
                                    '<td class="<%=weeks[0].days[1].classname%>"><a href="#"><span><%=weeks[0].days[1].text%></span></a></td>',
                                    '<td class="<%=weeks[0].days[2].classname%>"><a href="#"><span><%=weeks[0].days[2].text%></span></a></td>',
                                    '<td class="<%=weeks[0].days[3].classname%>"><a href="#"><span><%=weeks[0].days[3].text%></span></a></td>',
                                    '<td class="<%=weeks[0].days[4].classname%>"><a href="#"><span><%=weeks[0].days[4].text%></span></a></td>',
                                    '<td class="<%=weeks[0].days[5].classname%>"><a href="#"><span><%=weeks[0].days[5].text%></span></a></td>',
                                    '<td class="<%=weeks[0].days[6].classname%>"><a href="#"><span><%=weeks[0].days[6].text%></span></a></td>',
                                '</tr>',
                                '<tr>',
                                    '<th class="datepickerWeek"><a href="#"><span><%=weeks[1].week%></span></a></th>',
                                    '<td class="<%=weeks[1].days[0].classname%>"><a href="#"><span><%=weeks[1].days[0].text%></span></a></td>',
                                    '<td class="<%=weeks[1].days[1].classname%>"><a href="#"><span><%=weeks[1].days[1].text%></span></a></td>',
                                    '<td class="<%=weeks[1].days[2].classname%>"><a href="#"><span><%=weeks[1].days[2].text%></span></a></td>',
                                    '<td class="<%=weeks[1].days[3].classname%>"><a href="#"><span><%=weeks[1].days[3].text%></span></a></td>',
                                    '<td class="<%=weeks[1].days[4].classname%>"><a href="#"><span><%=weeks[1].days[4].text%></span></a></td>',
                                    '<td class="<%=weeks[1].days[5].classname%>"><a href="#"><span><%=weeks[1].days[5].text%></span></a></td>',
                                    '<td class="<%=weeks[1].days[6].classname%>"><a href="#"><span><%=weeks[1].days[6].text%></span></a></td>',
                                '</tr>',
                                '<tr>',
                                    '<th class="datepickerWeek"><a href="#"><span><%=weeks[2].week%></span></a></th>',
                                    '<td class="<%=weeks[2].days[0].classname%>"><a href="#"><span><%=weeks[2].days[0].text%></span></a></td>',
                                    '<td class="<%=weeks[2].days[1].classname%>"><a href="#"><span><%=weeks[2].days[1].text%></span></a></td>',
                                    '<td class="<%=weeks[2].days[2].classname%>"><a href="#"><span><%=weeks[2].days[2].text%></span></a></td>',
                                    '<td class="<%=weeks[2].days[3].classname%>"><a href="#"><span><%=weeks[2].days[3].text%></span></a></td>',
                                    '<td class="<%=weeks[2].days[4].classname%>"><a href="#"><span><%=weeks[2].days[4].text%></span></a></td>',
                                    '<td class="<%=weeks[2].days[5].classname%>"><a href="#"><span><%=weeks[2].days[5].text%></span></a></td>',
                                    '<td class="<%=weeks[2].days[6].classname%>"><a href="#"><span><%=weeks[2].days[6].text%></span></a></td>',
                                '</tr>',
                                '<tr>',
                                    '<th class="datepickerWeek"><a href="#"><span><%=weeks[3].week%></span></a></th>',
                                    '<td class="<%=weeks[3].days[0].classname%>"><a href="#"><span><%=weeks[3].days[0].text%></span></a></td>',
                                    '<td class="<%=weeks[3].days[1].classname%>"><a href="#"><span><%=weeks[3].days[1].text%></span></a></td>',
                                    '<td class="<%=weeks[3].days[2].classname%>"><a href="#"><span><%=weeks[3].days[2].text%></span></a></td>',
                                    '<td class="<%=weeks[3].days[3].classname%>"><a href="#"><span><%=weeks[3].days[3].text%></span></a></td>',
                                    '<td class="<%=weeks[3].days[4].classname%>"><a href="#"><span><%=weeks[3].days[4].text%></span></a></td>',
                                    '<td class="<%=weeks[3].days[5].classname%>"><a href="#"><span><%=weeks[3].days[5].text%></span></a></td>',
                                    '<td class="<%=weeks[3].days[6].classname%>"><a href="#"><span><%=weeks[3].days[6].text%></span></a></td>',
                                '</tr>',
                                '<tr>',
                                    '<th class="datepickerWeek"><a href="#"><span><%=weeks[4].week%></span></a></th>',
                                    '<td class="<%=weeks[4].days[0].classname%>"><a href="#"><span><%=weeks[4].days[0].text%></span></a></td>',
                                    '<td class="<%=weeks[4].days[1].classname%>"><a href="#"><span><%=weeks[4].days[1].text%></span></a></td>',
                                    '<td class="<%=weeks[4].days[2].classname%>"><a href="#"><span><%=weeks[4].days[2].text%></span></a></td>',
                                    '<td class="<%=weeks[4].days[3].classname%>"><a href="#"><span><%=weeks[4].days[3].text%></span></a></td>',
                                    '<td class="<%=weeks[4].days[4].classname%>"><a href="#"><span><%=weeks[4].days[4].text%></span></a></td>',
                                    '<td class="<%=weeks[4].days[5].classname%>"><a href="#"><span><%=weeks[4].days[5].text%></span></a></td>',
                                    '<td class="<%=weeks[4].days[6].classname%>"><a href="#"><span><%=weeks[4].days[6].text%></span></a></td>',
                                '</tr>',
                                '<tr>',
                                    '<th class="datepickerWeek"><a href="#"><span><%=weeks[5].week%></span></a></th>',
                                    '<td class="<%=weeks[5].days[0].classname%>"><a href="#"><span><%=weeks[5].days[0].text%></span></a></td>',
                                    '<td class="<%=weeks[5].days[1].classname%>"><a href="#"><span><%=weeks[5].days[1].text%></span></a></td>',
                                    '<td class="<%=weeks[5].days[2].classname%>"><a href="#"><span><%=weeks[5].days[2].text%></span></a></td>',
                                    '<td class="<%=weeks[5].days[3].classname%>"><a href="#"><span><%=weeks[5].days[3].text%></span></a></td>',
                                    '<td class="<%=weeks[5].days[4].classname%>"><a href="#"><span><%=weeks[5].days[4].text%></span></a></td>',
                                    '<td class="<%=weeks[5].days[5].classname%>"><a href="#"><span><%=weeks[5].days[5].text%></span></a></td>',
                                    '<td class="<%=weeks[5].days[6].classname%>"><a href="#"><span><%=weeks[5].days[6].text%></span></a></td>',
                                '</tr>',
                            '</tbody>'
                        ],
                        months: [
                            '<tbody class="<%=className%>">',
                                '<tr>',
                                    '<td colspan="2"><a href="#"><span><%=data[0]%></span></a></td>',
                                    '<td colspan="2"><a href="#"><span><%=data[1]%></span></a></td>',
                                    '<td colspan="2"><a href="#"><span><%=data[2]%></span></a></td>',
                                    '<td colspan="2"><a href="#"><span><%=data[3]%></span></a></td>',
                                '</tr>',
                                '<tr>',
                                    '<td colspan="2"><a href="#"><span><%=data[4]%></span></a></td>',
                                    '<td colspan="2"><a href="#"><span><%=data[5]%></span></a></td>',
                                    '<td colspan="2"><a href="#"><span><%=data[6]%></span></a></td>',
                                    '<td colspan="2"><a href="#"><span><%=data[7]%></span></a></td>',
                                '</tr>',
                                '<tr>',
                                    '<td colspan="2"><a href="#"><span><%=data[8]%></span></a></td>',
                                    '<td colspan="2"><a href="#"><span><%=data[9]%></span></a></td>',
                                    '<td colspan="2"><a href="#"><span><%=data[10]%></span></a></td>',
                                    '<td colspan="2"><a href="#"><span><%=data[11]%></span></a></td>',
                                '</tr>',
                            '</tbody>'
                        ]
                    };
              }

		} // --- EOF DatePicker Declaration (d)

        if (window.console && window.console.log) { window.console.log('DatePicker.init()')};

        // a kind of constructor for the "class" 'd'
        d.init(options);

        var cal = $(d.template.wrapper);
        d.cal = cal;

        //if (options.flat) {
        // fill the calendar according to the date object in flat mode directly
        //d.fill(cal.get(0));
        //cal.appendTo(this).show().css('position', 'relative');
        //d.layout(cal.get(0));
        //} else {

        if (!options.flat) {
            // append the calendar DIV to the document.body in order to SHOW it if the user clicks it
            //cal.appendTo(document.body);
            cal.appendTo($(t).parent());
            // bind the mousedown to the inputfield on SHOW
            $(t).mousedown(inputFieldClick);
        }

        //
        // the events of the datepicker
        // @see if you don't understand url: http://howtonode.org/what-is-this
        //
        function hideOnClick(e) {
            if (!d.processing && options.hideOnSelect) {
                d.hide();
                $(document).unbind('mousedown', hideOnClick);
                $(t.cal).unbind('mousedown', calendarSelect);
                $(t).unbind('blur', hideOnBlur);
                $(t).focus();
            } else {
                d.processing = false;
            }
        }
        function hideOnBlur(e) {
            if (!d.processing && options.hideOnSelect) {
                var timeSinceLastSelection = new Date().valueOf() - d.lastSelTime;
                if (window.console && window.console.log) { window.console.log('DatePicker.hideOnBlur(). Time since last selection: ' + timeSinceLastSelection); }
                // Did we recently click the calendar?
                // If yes: ignore blur event: focus should return to textfield
                if (timeSinceLastSelection > 700) {
                    d.hide();
                    $(document).unbind('mousedown', hideOnClick);
                    $(t.cal).unbind('mousedown', calendarSelect);
                    $(t).unbind('blur', hideOnBlur);
                } else {
                    e.preventDefault();
                    t.focus();
                }
            } else {
                d.processing = false;
            }
        }
        function calendarSelect(e) {
            if ($(e.target).is('span')) {
                e.target = e.target.parentNode;
            }
            var selectedEl = (e.target || e.srcElement);
            d.processing = true;
            d.selectElement($(selectedEl));
            e.preventDefault();
            t.focus();
        }
        function inputFieldClick(e) {
            if (t.cal.is(':hidden') && !t.readOnly) {
                d.processing = true;
                d.showCalendar(t);

                // Bind the click event to the calendar
                cal = cal.mousedown(calendarSelect);
                $(document).mousedown(hideOnClick);
                $(t).blur(hideOnBlur);
            }
        }
        d.destroyPicker = function () {
            if (t.picker) {
                if (window.console && window.console.log) { window.console.log('DatePicker.cleanup(), id: '+d.gDiv.id);}

                $(document).unbind('mousedown', hideOnClick);
                $(t.cal).unbind('mousedown', calendarSelect);
                $(t).unbind('mousedown', inputFieldClick);
                $(t).unbind('blur', hideOnBlur);

                // remove All event listener from inputField
                $(t).removeData();
                // Help GC
                t.p.prev = null;
                t.p.next = null;
                t.p.owner = null;
                t.p.onRender = null;
                t.p.onChange = null;
                t.p.onShow = null;
                t.p.onBeforeShow = null;
                t.p.onHide = null;
                t.p.locale = null;
                t.p = null;

                t.picker = null;
                t.cal = null;
                t = null;

                d.lastSel = null;
                d.current = null;

                // remove the calendar global DIV from the DOM
                $(d.gDiv).removeData();
                purge(d.gDiv);
                $(d.gDiv).empty();
                $(d.gDiv).remove();

                d.templateCache = null;

                d.gDiv = null;
                d = null;

                // Remove all jQuery stuff from the whole component
                $(this).removeData();
            }
            // http://javascript.crockford.com/memory/leak.html
            function purge(d){
                var a = d.attributes, i, l, n;
                if (a) {
                    l = a.length;
                    for (i = 0; i < l; i += 1) {
                        n = a[i].name;
                        if ('function' === typeof d[n]) {
                            d[n] = null;
                        }
                    }
                }
                a = d.childNodes;
                if (a) {
                    l = a.length;
                    for (i = 0; i < l; i += 1) {
                        purge(d.childNodes[i]);
                    }
                }
            };
        };
        d.remoteControl = function(e) {
            d.hide();
        }

        if (options.className) {
            cal.addClass(options.className);
        }
        var html = d.getHtml(d.template);
        cal.find('tr:first').append(html)
                .find('table').addClass(d.views[options.view]);

        d.gDiv = cal.get(0); // the global div element of the datePicker

        t.picker = d;
        t.p = options;
        t.cal = cal;
        //t.cal.hide();

        return t;
	}; // end datePicker


    // make some functions available from outside
	$.fn.datePicker = function(options) {
       return this.each( function() {
            $.addPicker(this, options);
       });
    };
    
    $.fn.pickerHide = function() {
        return this.each( function () {
             if (this.picker) this.picker.hide();
        });
    };
    $.fn.pickerDestroy = function () {
        return this.each(function(){
           if (this.picker) this.picker.destroyPicker();
        });
    };

    $.fn.pickerFocus = function (focusState) {
        return this.each(function(){
            if (this.picker) this.picker.focusPicker(focusState);
        });
    };

    $.fn.pickerRemoteControl = function (event) {
         return this.each(function(){
            if (this.picker) this.picker.remoteControl(event);
        });
	};
    /*
    $.fn.pickerSetDate = function(date, shiftTo){
        return this.each(function(){
            if (this.picker) this.picker.setPickerDate(date, shiftTo);
        });
    };
    $.fn.pickerGetDate = function(isFormated) {
        return this.each(function(){
           if (this.picker) this.picker.getPickerDate(isFormated);
        });
    };
    $.fn.pickerClear = function(){
        return this.each(function(){
            if (this.picker) this.picker.clearPicker();
        });
    };
    */
})(jQuery);
/*
 * Flexigrid for jQuery - New Wave Grid
 *
 * Copyright (c) 2008 Paulo P. Marinas (webplicity.net/flexigrid)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * $Date: 2008-07-14 00:09:43 +0800 (Tue, 14 Jul 2008) $
 */

(function($){

	$.addFlex = function(t,p)
	{

		if (t.grid) return false; //return if already exist

		// apply default properties
		p = $.extend({
			 height: 'auto', //auto height
			 width: 'auto', //auto width
			 striped: true, //apply odd even stripes
			 novstripe: false,
			 minwidth: 30, //min width of columns
			 minheight: 80, //min height of columns
			 resizable: false, //resizable table
			 url: false, //ajax url
			 method: 'POST', // data sending method
			 dataType: 'xml', // type of data loaded
			 errormsg: 'Connection Error',
			 usepager: false, //
			 nowrap: true, //
			 page: 1, //current page
			 total: 1, //total pages
			 useRp: true, //use the results per page select box
			 rp: 15, // results per page
			 rpOptions: [10,15,20,25,40],
			 title: false,
			 colModel: false, // the column model.
			 pagestat: 'Displaying {from} to {to} of {total} items',
			 procmsg: 'Processing, please wait ...',
			 hidecolmsg: 'Hide/Show Columns',
			 mintablemsg: 'Minimize/Maximize Table',
			 query: '',
			 qtype: '',
			 nomsg: 'No items',
			 minColToggle: 1, //minimum allowed column to be hidden
			 showToggleBtn: true, //show or hide column toggle popup
			 showPageStat: true,// show or hide the page statistics in the footer
			 hideOnSubmit: true,
			 autoload: true,
			 blockOpacity: 0.5,
			 onToggleCol: false,// using custom change visibility of column function
			 onChangeSort: false, // using custom change sort function
			 onSuccess: false, // using custom validate after addData function
			 onChangePage: false, // using custom change page function
			 onSubmit: false, // using a custom populate function
			 onPopulateCallback: false, // using a custom populate callback function with parsed params
			 onDragCol: false, // using a custom on column dragdrop callback function
			 onResizeCol: false, // using a custom on column resizing callback function
			 onResizeGrid: false, // using a custom on grid resizing callback function
			 owner: false, // the owner of the flexigrid component is used as 'this' for all callbacks
			 debug: false, // if true, you may see dub messages in the console (e.g. firebug)
			 sortorder: 'asc', // the initial sorting method for the pre-sorted column
			 sortModel: {columns: []}, // the sorting model contains columns with sort information
			 clientsort: true, // if true, the table is sorted on every processing request client side.
			 digitGroupDL: '.',// the delimiter to separate a group of digits (this is extracted during the search)
             decimalDelimiter: ',', // the delimiter to separate Decimal-Values
			 heightOffset: 100, // the offset used to correctly auto height the flexigrid table. Just play with the value.
             searchitems: false
		  }, p);


		$(t)
		.show() //show if hidden
		.attr({cellPadding: 0, cellSpacing: 0, border: 0})  //remove padding and spacing
		.removeAttr('width') //remove width properties
		;

        // -----------------------------------------------------------------------------------------------------------

		//create grid class
		var g = {
			hset : {},
			rePosDrag: function () {
				// If Debugging is enabled record the start time of the rendering process.
                if (p.debug) {
                    var startTime = new Date();
                }
				var cdleft = 0 - this.hDiv.scrollLeft;
				if (this.hDiv.scrollLeft>0) cdleft -= Math.floor(p.cgwidth/2);
				$(g.cDrag).css({top:g.hDiv.offsetTop+1});
				var cdpad = this.cdpad;
				// Select all possible drags and hide it. The selection is stored to a variable because
		        // we will reuse it later while iterate through the header cells.
				var qdrags = $('div', g.cDrag);
				qdrags.hide();
                // We do not use the regular each method of jQuery because we do need the index of the
                // header cell for other operation with the drags. (each is usually also slower than for)
                var qheaders = $('thead tr:first th:visible', this.hDiv);
                for (var n = 0; n < qheaders.length; n++) {
                    var cdpos = parseInt($('div', qheaders[n]).width());
                    if (cdleft == 0) {
                        cdleft -= Math.floor(p.cgwidth / 2);
                    }
                    cdpos = cdpos + cdleft + cdpad;
                    // Select the drag which is equals to the index of the current header cell.
                    $(qdrags[n]).css('left', cdpos + 'px').show();
                    cdleft = cdpos;
                }
                if (p.debug && window.console && window.console.log) {
                    // If debugging is enabled log the duration of this operation.
                    console.log('Duration of rePosDrag :' + (new Date() - startTime) + 'ms');
                }
            },

            /* ~~~~~ ECHO3 special handling start ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
            autoColumnWidth: function () {
            	// If Debugging is enabled record the start time of the rendering process.
                if (p.debug) {
                    var startTime = new Date();
                }
                var n = 0;
                var flexgrid = this;
                $('thead tr:first th:visible',this.hDiv).each(
                        function() {
                            // ? Do we really need to readdress the part; isn't it available somehow by the jquery.each()?
                            var columnWidth =  $('th:visible div:eq('+n+')',this.hDiv).width();
                            $('tr',flexgrid.bDiv).each (
                                    function ()
                                    {
                                        var cellWidth = $('td:visible div:eq('+n+')',this).width();
                                         if (columnWidth < cellWidth) {
                                         columnWidth = cellWidth;
                                         }
                                    }
                                    );

                            $('th:visible div:eq('+n+')',flexgrid.hDiv).css('width',columnWidth);
                            $('tr',flexgrid.bDiv).each (
                                    function ()
                                    {
                                        $('td:visible div:eq('+n+')',this).css('width',columnWidth);
                                    }
                                    );
                            $(flexgrid.hDiv).scrollLeft($(flexgrid.bDiv).scrollLeft);
                            flexgrid.rePosDrag();
                            flexgrid.fixHeight();
                            n++;

                        });
				if (p.debug && window.console && window.console.log) {
                    // If debugging is enabled log the duration of this operation.
                    var nowTime = new Date();
                    console.log('Duration of autoColumnWidth :' + (nowTime - startTime) + 'ms');
                }
            },
            /* ~~~~~ ECHO3 special handling END   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
			/**
			 * Method used to fix the height of the column drag-lines and the
			 * column visibility menu height (nDiv).
			 */
			fixHeight: function (newH) {
				// If Debugging is enabled record the start time of the rendering process.
                if (p.debug) {
                    var startTime = new Date();
                }
				newH = false;
				if (!newH) newH = $(g.bDiv).height();
				var hdHeight = $(this.hDiv).height();
				$('div',this.cDrag).each(
					function ()
						{
							$(this).height(newH+hdHeight);
						}
				);

				/*
				 * adjust the column visibility menu height (nDiv).
				 */
				/*
				var nd = parseInt($(g.nDiv).height());
				if (nd>newH)
					$(g.nDiv).height(newH).width(200);
				else
					$(g.nDiv).height('auto').width('auto');
				*/
				$(g.block).css({height:newH,marginBottom:(newH * -1)});

				var hrH = g.bDiv.offsetTop + newH;
				if (p.height != 'auto' && p.resizable) hrH = g.vDiv.offsetTop;
					$(g.rDiv).css({height: hrH});

				if (p.debug && window.console && window.console.log) {
                    // If debugging is enabled log the duration of this operation.
                    var nowTime = new Date();
                    console.log('Duration of fixHeight :' + (nowTime - startTime) + 'ms');
                }

			},
			dragStart: function (dragtype,e,obj) { //default drag function start

				if (dragtype=='colresize') //column resize
					{
						$(g.nDiv).hide();$(g.nBtn).hide();
						var n = $('div',this.cDrag).index(obj);
						var ow = $('th:visible div:eq('+n+')',this.hDiv).width();
						$(obj).addClass('dragging').siblings().hide();
						$(obj).prev().addClass('dragging').show();

						this.colresize = {startX: e.pageX, ol: parseInt(obj.style.left), ow: ow, n : n };
						$('body').css('cursor','col-resize');
					}
				else if (dragtype=='vresize') //table resize
					{
						var hgo = false;
						$('body').css('cursor','row-resize');
						if (obj)
							{
							hgo = true;
							$('body').css('cursor','col-resize');
							}
						this.vresize = {h: p.height, sy: e.pageY, w: p.width, sx: e.pageX, hgo: hgo};

					}

				else if (dragtype=='colMove') //column header drag
					{
						$(g.nDiv).hide();$(g.nBtn).hide();
						this.hset = $(this.hDiv).offset();
						this.hset.right = this.hset.left + $('table',this.hDiv).width();
						this.hset.bottom = this.hset.top + $('table',this.hDiv).height();
						this.dcol = obj;
						this.dcoln = $('th',this.hDiv).index(obj);

						this.colCopy = document.createElement("div");
						this.colCopy.className = "colCopy";
						this.colCopy.innerHTML = obj.innerHTML;
						if ($.browser.msie)
						{
						this.colCopy.className = "colCopy ie";
						}


						$(this.colCopy).css({position:'absolute',"float":'left',display:'none', textAlign: obj.align});

						$('body').append(this.colCopy);
						$(this.cDrag).hide();

					}

                // ECHO3: Die entsprechende Eigeneschaft wird wohl nicht  inherited, weil vermutlich
                // umliegende Echo-Komponenten diese woanders definierem:
                // Daher auf dem flexigrid-DIV selber arbeiten statt dem globalen BODY-Tag
                //$('body').noSelect();
				$(g.gDiv).noSelect();

			},
			dragMove: function (e) {

				if (this.colresize) //column resize
					{
						var n = this.colresize.n;
						var diff = e.pageX-this.colresize.startX;
						var nleft = this.colresize.ol + diff;
						var nw = this.colresize.ow + diff;
						if (nw > p.minwidth)
							{
								$('div:eq('+n+')',this.cDrag).css('left',nleft);
								this.colresize.nw = nw;
							}
					}
				else if (this.vresize) //table resize
					{
						var v = this.vresize;
						var y = e.pageY;
						var diff = y-v.sy;

						if (!p.defwidth) {
                            p.defwidth = p.width;
                        }

						if (p.width != 'auto' && !p.nohresize && v.hgo)
						{
							var x = e.pageX;
							var xdiff = x - v.sx;
							var newW = v.w + xdiff;
							if (newW > p.defwidth)
								{
									this.gDiv.style.width = newW + 'px';
									p.width = newW;
								}
						}

						var newH = v.h + diff;
						if ((newH > p.minheight || p.height < p.minheight) && !v.hgo)
							{
								this.bDiv.style.height = newH + 'px';
								p.height = newH;
								this.fixHeight(newH);
							}
						v = null;
					}
				else if (this.colCopy) {
					$(this.dcol).addClass('thMove').removeClass('thOver');
					if (e.pageX > this.hset.right || e.pageX < this.hset.left
                            || e.pageY > this.hset.bottom || e.pageY < this.hset.top)
                    {
						//this.dragEnd();
						$('body').css('cursor','move');
					} else {
                        $('body').css('cursor', 'pointer');
                    }
					$(this.colCopy).css({top:e.pageY + 10,left:e.pageX + 20, display: 'block'});
				}

			},
			dragEnd: function () {
				// If Debugging is enabled record the start time of the rendering process.
                if (p.debug) {
                    var startTime = new Date();
                }
				if (this.colresize)
					{
						var n = this.colresize.n;// index of column
						var nw = this.colresize.nw;// new width of column

						var columnSel = $('th:visible div:eq('+n+')',this.hDiv);
						columnSel.css('width',nw);
						$('tr',this.bDiv).each (
							function ()
								{
								$('td:visible div:eq('+n+')',this).css('width',nw);
								}
						);
						// synchronize the header and the body while scrolling
						this.hDiv.scrollLeft = this.bDiv.scrollLeft;


						$('div:eq('+n+')',this.cDrag).siblings().show();
						$('.dragging',this.cDrag).removeClass('dragging');
						this.rePosDrag();
						this.fixHeight();
						this.colresize = false;

						if (p.onResizeCol && p.colModel) {
							var columnId = p.colModel[n].name;
							p.onResizeCol.call(p.owner, columnId, nw);
						}
						if (p.debug && window.console && window.console.log) {
		                    // If debugging is enabled log the duration of this operation.
		                    var nowTime = new Date();
		                    console.log('Duration of dragEnd (colresize) :' + (nowTime - startTime) + 'ms');
		                }
					}
				else if (this.vresize)
					{
						this.vresize = false;
						if (p.onResizeGrid) {
							p.onResizeGrid.call(p.owner, p.width, p.height);
						}
					}
				else if (this.colCopy)
					{
						$(this.colCopy).remove();
						if (this.dcolt != null)
							{


							if (this.dcoln>this.dcolt)
								$('th:eq('+this.dcolt+')',this.hDiv).before(this.dcol);
							else
								$('th:eq('+this.dcolt+')',this.hDiv).after(this.dcol);



							this.switchCol(this.dcoln,this.dcolt);
							$(this.cdropleft).remove();
							$(this.cdropright).remove();
							this.rePosDrag();

							if (p.onDragCol && p.colModel)
								var sourceColumnId = p.colModel[this.dcoln].name;
								var targetColumnId = p.colModel[this.dcolt].name;
								p.onDragCol.call(p.owner, sourceColumnId, targetColumnId);

						}

						this.dcol = null;
						this.hset = null;
						this.dcoln = null;
						this.dcolt = null;
						this.colCopy = null;

						$('.thMove',this.hDiv).removeClass('thMove');
						$(this.cDrag).show();

						if (p.debug && window.console && window.console.log) {
		                    // If debugging is enabled log the duration of this operation.
		                    var nowTime = new Date();
		                    console.log('Duration of dragEnd (colCopy) :' + (nowTime - startTime) + 'ms');
		                }
					}
				$('body').css('cursor','default');
				// $('body').noSelect(false);
                // ECHO3 : siehe comment in dragStart
				$(g.gDiv).noSelect(false);
			},
			toggleCol: function(cid,visible) {

				var ncol = $("th[axis='col"+cid+"']",this.hDiv)[0];
				var n = $('thead th',g.hDiv).index(ncol);
				var cb = $('input[value='+cid+']',g.nDiv)[0];


				if (visible==null)
					{
						visible = ncol.hide;
					}



				if ($('input:checked',g.nDiv).length<p.minColToggle&&!visible) return false;

				if (visible)
					{
						ncol.hide = false;
						$(ncol).show();
						cb.checked = true;
					}
				else
					{
						ncol.hide = true;
						$(ncol).hide();
						cb.checked = false;
					}

						$('tbody tr',t).each
							(
								function ()
									{
										if (visible)
											$('td:eq('+n+')',this).show();
										else
											$('td:eq('+n+')',this).hide();
									}
							);

				this.rePosDrag();

				if (p.onToggleCol && p.colModel){
					/*
					 * ECHO3 we need the owner of the object as 'this'.
					 * Event if column visibility is changed.
					 */
					var columnId = p.colModel[cid].name;
					p.onToggleCol.call(p.owner, columnId, visible);
				}
				return visible;
			},

			// After columns are dragged and dropped the data has to be adjusted.
			switchCol: function(cdrag,cdrop) { //switch columns

				$('tbody tr',t).each
					(
						function ()
							{
								if (cdrag>cdrop)
									$('td:eq('+cdrop+')',this).before($('td:eq('+cdrag+')',this));
								else
									$('td:eq('+cdrop+')',this).after($('td:eq('+cdrag+')',this));
							}
					);

					//switch order in nDiv
					if (cdrag>cdrop)
						$('tr:eq('+cdrop+')',this.nDiv).before($('tr:eq('+cdrag+')',this.nDiv));
					else
						$('tr:eq('+cdrop+')',this.nDiv).after($('tr:eq('+cdrag+')',this.nDiv));

					if ($.browser.msie&&$.browser.version<7.0){ $('tr:eq('+cdrop+') input',this.nDiv)[0].attr('checked', true);}

					this.hDiv.scrollLeft = this.bDiv.scrollLeft;

					if (p.debug && window.console && window.console.log) {
	                    console.log('Triggered switchCol.');
	                }
			},

			// the action triggered by the scroll event in the body div (bDiv)
			scroll: function() {
					this.hDiv.scrollLeft = this.bDiv.scrollLeft;
					this.rePosDrag();
			},

			addData: function (data) {
                if (!data) {
                    // There is no data after loading. Interrupt the loading here,
                    // set busy to to false and display an error message.
                    g.setBusy(false);
                    finalizeRendering();
                    return false;
                }

				if (p.dataType=='xml') {
                    p.total = +$('rows total',data).text();
                } else {
                    p.total = data.total;
                }

				if (p.total==0)
					{
					$('tr, a, td, div',t).unbind();
					$(t).empty();
					p.pages = 1;
					p.page = 1;
					this.buildpager();
					$('.pPageStat',this.pDiv).html(p.nomsg);
					// Call the onSuccess hook (if present).
                    if (p.onSuccess) {
                    	p.onSuccess.call(p.owner);
                    }
					g.setBusy(false);
					return false;
				}

				p.pages = Math.ceil(p.total/p.rp);

				if (p.dataType=='xml')
					p.page = +$('rows page',data).text();
				else
					p.page = data.page;

				// Build new tbody...
				var tbody = document.createElement('tbody');
				// Select the body before. This is better because this selected jQuery object could
				// be used more then one times in the next steps.
				var qtbody = $(tbody);

				// set the heights before rendering finished
                if (p.height == 'auto') {
                	var globalDiv = $(g.gDiv);
                	/*
                	 * can not be used... its more complicated.
                	 * the idea was to measure all prev siblings (divs)
                	 *
                	var componentHeight = globalDiv.attr('offsetHeight');
					globalDiv.prevAll().each(function () {
				        componentHeight += $(this).attr('offsetHeight');
					});
					*/
                    var bHeight = globalDiv.offsetParent().attr('offsetHeight') - p.heightOffset;
                    bHeight = bHeight > 50 ? bHeight : 50;
			        // adjust the flexigrid body (table) height
	                $(g.bDiv).css({ height: bHeight+"px"});
	                // adjust the column visibility menu height and width
	                var mHeight = bHeight - 100;
	                $(g.nDiv).height(mHeight > 50 ? mHeight : 100).width(200);
					if (p.debug && window.console && window.console.log) {
			            console.log('Finalize calculated height :' + bHeight + ' px, ' +
                                'heightOffset: ' + p.heightOffset + ' px, menuHeight: ' + mHeight);
			        }
                }

                if (p.debug) {
                    // If Debugging is enabled record the start time of the rendering process.
                    var startTime = new Date();
                }

                /**
                 * This method is used to finalize the rendering of the data to the body if the grid list.
                 * @return (void)
                 */
                function finalizeRendering() {
                    var qt = $(t);
                    // Clean the current body complete and add the new generated body.
                    $('tr', qt).unbind();
                    qt.empty();
                    qt.append(qtbody);

					g.rePosDrag();

                    // This is paranoid but set the variables back to null. It is better for debugging.
                    tbody = null;
                    qtbody = null;
                    data = null;

                    // Call the onSuccess hook (if present).
                    if (p.onSuccess) {
                    	p.onSuccess.call(p.owner);
                    }
                    // Deactivate the busy mode.
                    g.setBusy(false);
                    if (g.lazyFocus) {
                    	g.lazyFocus.call(this, true);
                    }
                    g.buildpager();
                    if (p.debug && window.console && window.console.log) {
                        // If debugging is enabled log the duration of this operation.
                        var nowTime = new Date();
                        console.log('Duration of rendering data of type "' + p.dataType + '": ' + (nowTime - startTime) + 'ms');
                    }
                    return false;
                }
                // We will need the header cell at this point more times.
                // So we do better to store it not for further usages.
                var headers = $('thead tr:first th',g.hDiv);

                // What is going on here? Because of many rows we have to render, we do not
                // iterate with a regular foreach method. We make a pseudo asynchron process with
                // the setTimeout method. We do better to do this because in other way we will
                // force a lagging of the whole browser. In the worst case the user will get a
                // dialog box of an "endless looping javaScript".

                if (p.dataType=='json') {
                    // Prepare the looping parameters.
                    var ji = 0;
                    var row = null;

                    /**
                     * Processes a data row in the JSON data stream
                     * @return true if data was processed, false otherwise (no more data)
                     */
                    function doJsonRow() {
                        // Let's try to process this amount of rows per "timeout" cycle
                        // Hopefully MSIE will be fast enough.
                        var rowsPerBatch = 20;

                        do {
                            rowsPerBatch--;
                            // Only if there are more rows we will render a next row.
                            if (data && data.rows.length > ji && data.rows[ji]) {
                                row = data.rows[ji];
                                var tr = document.createElement('tr');
                                var qtr = $(tr);
                                if (ji % 2 && p.striped) {
                                    tr.className = 'erow';
                                }
                                if (row.id === null) {
                                    // nothing to do.
                                } else {
                                    tr.id = 'row' + row.id;
                                }
                                // Add each cell for each header column (rowDataIndex)
                                var colCount = headers.length;
                                for (var idx = 0; idx < colCount; idx++) {
                                    var th = headers[idx];
                                    var rowDataIdx = $(th).data('rowDataIndex'); // retrieves the value rowDataIndex

                                    var td = document.createElement('td');
                                    if (th) {
                                        td.align = th.align;
                                    }
                                    qtr.append(td);
                                    g.addCellProp(td, qtr, row.cell[rowDataIdx], th);
                                }
                                qtbody.append(tr);
                                g.addRowProp(qtr);
                                // Prepare the next step.
                                ji++;
                                if (rowsPerBatch <= 0) {
                                    setTimeout(doJsonRow, 1);
                                    return true;
                                }
                            } else {
                                rowsPerBatch = 0;
                            }
                        } while (rowsPerBatch > 0);

                        // No more data? Finalize
                        finalizeRendering();
                        return false;
                    }

                    // Start the pseudo asynchron iteration.
                    // Processing the JSON input may take some time esp. on crappy MSIEs.
                    // Using this timeout mechanism we avoid "unresponsible script" warn dialogs.
                    setTimeout(doJsonRow, 1);

                } else if (p.dataType=='xml') {
                    // Prepare the looping parameters.
                    var index = 1;
                    var xi = 0;
                    var rows = $("rows row", data);


                    function doXmlRow() {
                        // Only if there are more rows we will render a next row.
                        if (xi < rows.length) {
                            var row = rows[xi];
                            // Paranoid I know but it possible that there is an array selected with
                            // null entries.
                            if (row) {
                                var qrow = $(row);
                                index++;
                                var tr = document.createElement('tr');
                                var qtr = $(tr);
                                if (index % 2 && p.striped) {
                                    tr.className = 'erow';
                                }
                                var nid = qrow.attr('id');
                                if (nid === null) {
                                	// nothing to do
                                } else {
                                    tr.id = 'row' + nid;
                                }
                                nid = null;
                                var cells = $('cell', row);
                                // Add each cell
                                for (var idx = 0; idx < cells.length; idx++) {
                                    var td = document.createElement('td');
                                    var th = idx < headers.length ? headers[idx] : null;
                                    if (th) {
                                        td.align = th.align;
                                    }
                                    qtr.append(td);
                                    g.addCellProp(td, qtr, $(cells[idx]).text(), th);
                                }
                                qtbody.append(tr);
                                // Prepare the next step.
                                tr = null;
                                xi++;
                                setTimeout(doXmlRow, 1);
                            } else {
                                finalizeRendering();
                            }
                        } else {
                            finalizeRendering();
                        }
                    }
                    // Start the pseudo asynchron iteration.
                    // Processing the XML input may take some time esp. on crappy MSIEs.
                    // Using this timeout mechanism we avoid "unresponsible script" warn dialogs.
                    setTimeout(doXmlRow, 1);
                } else {
                    throw new Error('DataType "' + p.dataType + '" could not be handled.');
                }
			},

			/**
			 * On change sort.
			 */
			changeSort: function(th, multiSelect) { //change sortorder
				if (p.debug){ var startTime = new Date(); }

				if (this.loading) return true;

				// we are sorting, so visualize the processing
				this.setBusy(true);
				$(g.nDiv).hide();$(g.nBtn).hide();

				if (!multiSelect) {
					if (p.debug){ var cleanStartTime = new Date(); }
					// remove all sorted columns from the model
					p.sortModel.columns = [];
					// remove all classes from the other header columns.
					var thDiv = $('div', th);
					$('thead tr:first th div', this.hDiv).not(thDiv).removeClass('sdesc').removeClass('sasc');

					$(th).siblings().removeClass('sorted');
					if (p.debug && window.console && window.console.log){
						console.log('Multiselect is false, cleaned up columns in ' + (new Date() - cleanStartTime) + 'ms. '
							+ 'remaining column: "' + $(th).attr('abbr') + '" classes: "' + thDiv.attr('class') + '"');
					}
				}

				// set or add the sorting order in the model
				var thdiv = $('div', th);
				var isSorted = $(th).hasClass('sorted');

				var sortColumn = new Object();
				var abbrSelector = $(th).attr('abbr');
				// if already sorted column, toggle sorting
				if (isSorted){
					var no = '';
					if (p.sortModel.columns.length > 0) {
						for (var idx = 0; idx < p.sortModel.columns.length; idx++) {
							var column = p.sortModel.columns[idx];
							if (column.columnId == abbrSelector) {
								column.sortOrder = ($(thdiv).hasClass('sasc')? 'asc':'desc');
								sortColumn = column;
								break;
							}
						}
					} else {
						var sortColumn = new Object({
							columnId: abbrSelector,
							sortOrder: ($(thdiv).hasClass('sasc')? 'asc':'desc')
						});
						p.sortModel.columns.push(sortColumn);
					}
				}
				// not sorted column, activate default sorting
				else if (!isSorted) {
					$(th).addClass('sorted');
					thdiv.addClass('s' + p.sortorder);
					var sortColumn = new Object({
						columnId: abbrSelector,
						sortOrder: p.sortorder
					});
					p.sortModel.columns.push(sortColumn);
				}

				if (p.onChangeSort){
					/*
					 * ECHO3 we need the owner of the object as 'this'.
					 */
					p.onChangeSort.call(p.owner, p.sortModel);
				}

				this.setBusy(false);
				if (p.debug && window.console && window.console.log) {
                    // If debugging is enabled log the duration of this operation.
                    var nowTime = new Date();
                    var multiSelectMsg = multiSelect ? 'yes':'no';
                    console.log('Change sort to ' + sortColumn.sortOrder + ' for column ' + sortColumn.columnId + ':'
                    + (nowTime - startTime) + 'ms' + ' (CRTL pressed: ' + multiSelectMsg + ')');
                }
			},

			buildpager: function(){ //rebuild pager based on new properties

				$('.pcontrol input',this.pDiv).val(p.page);
				$('.pcontrol span',this.pDiv).html(p.pages);

				var r1 = (p.page-1) * p.rp + 1;
				var r2 = r1 + p.rp - 1;

				if (p.total<r2) r2 = p.total;

				var stat = p.pagestat;

				stat = stat.replace(/{from}/,r1);
				stat = stat.replace(/{to}/,r2);
				stat = stat.replace(/{total}/,p.total);

				$('.pPageStat',this.pDiv).html(stat);

			},

            /**
             * This method is used to control the grid busy state.
             *
             * @param busy if set to true the grid list will get a semi transparent layer, a loading message will be displayed and a spinner.
             * If set to false this layer, spinner and message will be removed.
             * @return (boolean) true if the state is changed.
             */
            setBusy: function (busy) {
                var result = false;
                if (busy) {
                    if (!this.loading) {
                        this.loading = true;
                        $('.pPageStat',this.pDiv).html(p.procmsg);
                        $('.pReload',this.pDiv).addClass('loading');
                        $(g.block).css({top:g.bDiv.offsetTop});
                        if (p.hideOnSubmit) {
                            $(this.gDiv).prepend(g.block); //$(t).hide();
                        }
                        if ($.browser.opera) {
                            $(t).css('visibility','hidden');
                        }
                        result = true;
                    }
                } else {
                    if (this.loading) {
                        var qstatus = $('.pPageStat',this.pDiv);
                        if (qstatus.html() == p.procmsg) {
                            $('.pPageStat',this.pDiv).text('');
                        }
                        $('.pReload',this.pDiv).removeClass('loading');
                        if (p.hideOnSubmit) {
                            $(g.block).remove(); //$(t).show();
                        }
                        g.hDiv.scrollLeft = g.bDiv.scrollLeft;
                        if ($.browser.opera) {
                            $(t).css('visibility','visible');
                        }

                        this.loading = false;
                        result = true;
                    }
                }
                return result;
            },

            populate: function () { //get latest data


				if (this.loading) return true;

				if (p.onSubmit)
					{
						var gh = p.onSubmit();
						if (!gh) return false;
					}

				if (!p.url) return false;

                // Make this grid list busy for the user.
                this.setBusy(true);

				if (!p.newp) p.newp = 1;

				if (p.page>p.pages) p.page = p.pages;
				var params = [
					 { name : 'page', value : p.newp }
					,{ name : 'rp', value : p.rp }
					,{ name : 'query', value : p.query}
					,{ name : 'qtype', value : p.qtype}
				];
				var data = [];

                // Only add parameters to request data which are not null.
                for (i in params) {
                    var param = params[i];
                    if (param && param.name && param.value) {
                        data.push(param);
                    }
                }

				/* COMMENT-ECHO3: We need to use echo3 calls instead of ajax URL based approach. */
                data = p.onPopulateCallback.call(p.owner, data);
                g.addData(data);

				// do sorting
				if (data && p.clientsort && p.sortModel && p.sortModel.columns.length > 0) {
					this.multiSort(p.sortModel, new exxcellent.model.ColumnModel(p.colModel), new exxcellent.model.TableModel(new Array(data)));
            	}
			},

			doSearch: function () {
				p.query = $('input[name=q]',g.sDiv).val();
				p.qtype = $('select[name=qtype]',g.sDiv).val();
				p.newp = 1;

				this.populate();
			},

			changePage: function (ctype){ //change page

				if (this.loading) return true;

				switch(ctype)
				{
					case 'first': p.newp = 1; break;
					case 'prev': if (p.page>1) p.newp = parseInt(p.page) - 1; break;
					case 'next': if (p.page<p.pages) p.newp = parseInt(p.page) + 1; break;
					case 'last': p.newp = p.pages; break;
					case 'input':
							var nv = parseInt($('.pcontrol input',this.pDiv).val());
							if (isNaN(nv)) nv = 1;
							if (nv<1) nv = 1;
							else if (nv > p.pages) nv = p.pages;
							$('.pcontrol input',this.pDiv).val(nv);
							p.newp =nv;
							break;
				}

				if (p.newp==p.page) return false;

				if (p.onChangePage) {
					/*  ECHO3 we need the owner of the object as 'this'. */
					p.onChangePage.call(p.owner, p.newp);
				}
				this.populate();

			},

			addCellProp: function (cell, prnt, innerHtml, pth) {
                var tdDiv = document.createElement('div');
                var qtdDiv = $(tdDiv);
                var qcell = $(cell);
                if (pth != null) {
                    if ($(pth).hasClass('sorted')) {
                        //cell.className = 'sorted';
                        qcell.addClass('sorted');
                    }
                    qtdDiv.css({textAlign:pth.align,width: $('div:first', pth)[0].style.width});
                    if (pth.hide) {
                        qcell.css('display', 'none');
                    }
                }
                if (!p.nowrap) {
                    qtdDiv.css('white-space', 'normal');
                }
                if (!innerHtml || innerHtml == '') {
                    innerHtml = '&nbsp;';
                }
				tdDiv.innerHTML = innerHtml;

				qcell.empty().append(tdDiv).removeAttr('width');
            },

			getCellDim: function (obj) // get cell prop for editable event
			{
				var ht = parseInt($(obj).height());
				var pht = parseInt($(obj).parent().height());
				var wt = parseInt(obj.style.width);
				var pwt = parseInt($(obj).parent().width());
				var top = obj.offsetParent.offsetTop;
				var left = obj.offsetParent.offsetLeft;
				var pdl = parseInt($(obj).css('paddingLeft'));
				var pdt = parseInt($(obj).css('paddingTop'));
				return {ht:ht,wt:wt,top:top,left:left,pdl:pdl, pdt:pdt, pht:pht, pwt: pwt};
			},

			addRowProp: function(qrow) {
                qrow.click(function (e) {
                    var obj = (e.target || e.srcElement);
                    if (obj.href || obj.type) {
                        return true;
                    }
                    $(this).toggleClass('trSelected');
                    if (p.singleSelect) {
                        qrow.siblings().removeClass('trSelected');
                    }
                    g.selectedRow = $(this);
                    e.stopPropagation();

                }).mousedown(function (e) {
                    if (e.shiftKey) {
                        $(this).toggleClass('trSelected');
                        g.multisel = true;
                        $(g.gDiv).noSelect();
                    }
                }).mouseup(function (e) {
                	e.stopPropagation();
                    if (g.multisel) {
                        g.multisel = false;
                        $(g.gDiv).noSelect(false);
                    }
                    // process the row selection event
                    var obj = (e.target || e.srcElement);
                    if (p.onSelectRow)  {
						/*
						 * ECHO3 we need the p.owner of the object as 'this'.
						 */
                    	var pid = this.id.substr(3);
						p.onSelectRow.call(p.owner, pid, obj);
                    }
                }).hover(function () {/*hover-in*/
                    if (g.multisel) {
                        $(this).toggleClass('trSelected');
                    }
                }, function () {/*hover-out*/
                });
                if ($.browser.msie && $.browser.version < 7.0) {
                    qrow.hover(function () {
                        $(this).addClass('trOver');
                    }, function () {
                        $(this).removeClass('trOver');
                    });
                }
			},
			pager: 0
        }; // --- EOF Grid Declaration (g)

        // -----------------------------------------------------------------------------------------------------------

		//analyze column model if any
		if (p.colModel)
		{
			var thead = document.createElement('thead');
			var tr = document.createElement('tr');

			for (var i=0;i<p.colModel.length;i++)
				{
					var cm = p.colModel[i];
					var th = document.createElement('th');

					th.innerHTML = cm.display;

					if (cm.name !== null && cm.sortable) {
						$(th).attr('abbr',cm.name);
					}
					if (cm.tooltip !== null) {
						$(th).attr('title', cm.tooltip);
					}

					$(th).attr('axis','col'+i);

					if (cm.align)
						th.align = cm.align;

					if (cm.width)
						$(th).attr('width',cm.width);

					if (cm.hide)
						{
						th.hide = true;
						}

					if (cm.process)
						{
							th.process = cm.process;
						}

					// store the data index using jquery
					$(th).data('rowDataIndex', i); // sets the value of userid

					$(tr).append(th);
				}
			$(thead).append(tr);
			$(t).prepend(thead);
		} // end if p.colmodel

		//init divs
		g.gDiv = document.createElement('div'); //create global container
		g.mDiv = document.createElement('div'); //create title container
		g.hDiv = document.createElement('div'); //create header container
		g.bDiv = document.createElement('div'); //create body container
		g.vDiv = document.createElement('div'); //create grip
		g.rDiv = document.createElement('div'); //create horizontal resizer
		g.cDrag = document.createElement('div'); //create column drag
		g.block = document.createElement('div'); //creat blocker
		g.nDiv = document.createElement('div'); //create column show/hide popup
		g.nBtn = document.createElement('div'); //create column show/hide button
		g.iDiv = document.createElement('div'); //create editable layer
		g.tDiv = document.createElement('div'); //create toolbar
		g.sDiv = document.createElement('div');

		if (p.usepager || p.showPageStat) g.pDiv = document.createElement('div'); //create pager container
		g.hTable = document.createElement('table');

		//set gDiv
		g.gDiv.className = 'flexigrid';
		if (p.width!='auto') g.gDiv.style.width = p.width + 'px';

		//add conditional classes
		if ($.browser.msie)
			$(g.gDiv).addClass('ie');

		if (p.novstripe)
			$(g.gDiv).addClass('novstripe');

		$(t).before(g.gDiv);
		$(g.gDiv).append(t);

		//set toolbar
		if (p.buttons)
		{
			g.tDiv.className = 'tDiv';
			var tDiv2 = document.createElement('div');
			tDiv2.className = 'tDiv2';

            if (p.debug && window.console && window.console.log) {
                console.log('Grid has ' + p.buttons.length + ' custom buttons.');
            }

			for (i=0;i<p.buttons.length;i++)
				{
					var btn = p.buttons[i];
					if (!btn.separator)
					{
						var btnDiv = document.createElement('div');
						btnDiv.className = 'fbutton';
						btnDiv.innerHTML = "<div><span>"+btn.name+"</span></div>";
						if (btn.bclass)
							$('span',btnDiv)
							.addClass(btn.bclass)
							.css({paddingLeft:20})
							;
						btnDiv.onpress = btn.onpress;
						btnDiv.name = btn.name;
						if (btn.onpress)
						{
							$(btnDiv).click
							(
								function ()
								{
								this.onpress(this.name,g.gDiv);
								}
							);
						}
						$(tDiv2).append(btnDiv);
						if ($.browser.msie&&$.browser.version<7.0)
						{
							$(btnDiv).hover(function(){$(this).addClass('fbOver');},function(){$(this).removeClass('fbOver');});
						}

					} else {
						$(tDiv2).append("<div class='btnseparator'></div>");
					}
				}
				$(g.tDiv).append(tDiv2);
				$(g.tDiv).append("<div style='clear:both'></div>");
				$(g.gDiv).prepend(g.tDiv);
		}

		//set hDiv
		g.hDiv.className = 'hDiv';

		$(t).before(g.hDiv);

		//set hTable
        g.hTable.cellPadding = 0;
        g.hTable.cellSpacing = 0;
        $(g.hDiv).append('<div class="hDivBox"></div>');
        $('div',g.hDiv).append(g.hTable);
        var thead = $("thead:first",t).get(0);
        if (thead) $(g.hTable).append(thead);
        thead = null;

		if (!p.colmodel) var ci = 0;
		if(p.debug && window.console && window.console.log){
			console.log("Building table header");
		}

		//setup table header (thead)
		$('thead tr:first th',g.hDiv).each
		(
		 	function ()
				{
					var thdiv = document.createElement('div');
                    var qth = $(this);

                    var columnNameSelector = qth.attr('abbr');
                    if (columnNameSelector){
							// click on a column (change sorting)
							qth.click(
								function (e) {
									if (!$(this).hasClass('thOver')) return false;
									var obj = (e.target || e.srcElement);
									if (obj.href || obj.type) return true;

									var thDiv = $('div', this);
									if (thDiv.hasClass('active')){
										thDiv.toggleClass('sasc');
										thDiv.toggleClass('sdesc');
									} else {
										thDiv.addClass('active');
									}
									g.changeSort(this, e.ctrlKey);
								}
							)
							;
							// setup initial sorting
							if (p.sortModel && p.sortModel.columns) {
								for (i=0; i<p.sortModel.columns.length; i++) {
									var sortColumn = p.sortModel.columns[i];
									if (columnNameSelector === sortColumn.columnId) {
                                        //var cellElement = this;
                                        //cellElement.className = 'sorted';
                                        qth.addClass('sorted');
										thdiv.className = 's'+ sortColumn.sortOrder;
									}
								}
							}
						}
						// setup initial hiding
						if (this.hide) qth.hide();

						if (!p.colmodel) {
							qth.attr('axis','col' + ci++);
						}


					 $(thdiv).css({textAlign:this.align, width: this.width + 'px'});
					 thdiv.innerHTML = this.innerHTML;

					qth.empty().append(thdiv).removeAttr('width')
					.mousedown(function (e)
						{
							g.dragStart('colMove',e,this);
						})
					.hover(
						// hover in function
						function(){
							if (!g.colresize&&!$(this).hasClass('thMove')&&!g.colCopy) $(this).addClass('thOver');
							// check if sortable column
							if ($(this).attr('abbr')) {
								var thDiv = $('div',this);
								var isSorted = $(this).hasClass('sorted');
								if (!isSorted && !g.colCopy && !g.colresize) {
									thDiv.addClass('s' + p.sortorder);
								}
								else if (isSorted && !g.colCopy && !g.colresize){
									thDiv.toggleClass('sasc');
									thDiv.toggleClass('sdesc');
								}
							}
							// drop the dragged column on another column (hover-in)
							if (g.colCopy)
								{
								var n = $('th',g.hDiv).index(this);

								if (n==g.dcoln) return false;



								if (n<g.dcoln) $(this).append(g.cdropleft);
								else $(this).append(g.cdropright);

								g.dcolt = n;

							} else if (!g.colresize) {

								var nv = $('th:visible',g.hDiv).index(this);
								var onl = parseInt($('div:eq('+nv+')',g.cDrag).css('left'));
								var nw = parseInt($(g.nBtn).width()) + parseInt($(g.nBtn).css('borderLeftWidth'));
								var nl = onl - nw + Math.floor(p.cgwidth/2);

								$(g.nDiv).hide();$(g.nBtn).hide();

								$(g.nBtn).css({'left':nl,top:g.hDiv.offsetTop}).show();

								var ndw = parseInt($(g.nDiv).width());

								$(g.nDiv).css({top:g.bDiv.offsetTop});

								if ((nl+ndw)>$(g.gDiv).width())
									$(g.nDiv).css('left',onl-ndw+1);
								else
									$(g.nDiv).css('left',nl);

								if ($(this).hasClass('sorted'))
									$(g.nBtn).addClass('srtd');
								else
									$(g.nBtn).removeClass('srtd');

							}

						},
						// hover out function
						function(){
							$(this).removeClass('thOver');
							var thDiv = $('div', this);
							if(!$(thDiv).hasClass('active')) {
								var thDiv = $('div',this);
								if (!$(this).hasClass('sorted')){
									thDiv.removeClass('s' + p.sortorder);
								} else {
									thDiv.toggleClass('sasc');
									thDiv.toggleClass('sdesc');
								}
							} else {
								$(thDiv).removeClass('active');
							}
							if (g.colCopy) {
								$(g.cdropleft).remove();
								$(g.cdropright).remove();
								g.dcolt = null;
							}
						})
					; //wrap content
				}
		);

		//set bDiv (body div)
		g.bDiv.className = 'bDiv';
		$(t).before(g.bDiv);

		$(g.bDiv).css({ height: (p.height=='auto') ? '50 px' : p.height+"px"})
		.scroll(function (e) {
			g.scroll();
			return true;
		})
		.append(t)
		;

		if (p.height == 'auto')
			{
			$('table',g.bDiv).addClass('autoht');
			}


		$('tbody', g.bDiv).hide();

		//set cDrag
		var cdcol = $('thead tr:first th:first',g.hDiv).get(0);

		if (cdcol != null)
		{
		g.cDrag.className = 'cDrag';
		g.cdpad = 0;

		g.cdpad += (isNaN(parseInt($('div',cdcol).css('borderLeftWidth'))) ? 0 : parseInt($('div',cdcol).css('borderLeftWidth')));
		g.cdpad += (isNaN(parseInt($('div',cdcol).css('borderRightWidth'))) ? 0 : parseInt($('div',cdcol).css('borderRightWidth')));
		g.cdpad += (isNaN(parseInt($('div',cdcol).css('paddingLeft'))) ? 0 : parseInt($('div',cdcol).css('paddingLeft')));
		g.cdpad += (isNaN(parseInt($('div',cdcol).css('paddingRight'))) ? 0 : parseInt($('div',cdcol).css('paddingRight')));
		g.cdpad += (isNaN(parseInt($(cdcol).css('borderLeftWidth'))) ? 0 : parseInt($(cdcol).css('borderLeftWidth')));
		g.cdpad += (isNaN(parseInt($(cdcol).css('borderRightWidth'))) ? 0 : parseInt($(cdcol).css('borderRightWidth')));
		g.cdpad += (isNaN(parseInt($(cdcol).css('paddingLeft'))) ? 0 : parseInt($(cdcol).css('paddingLeft')));
		g.cdpad += (isNaN(parseInt($(cdcol).css('paddingRight'))) ? 0 : parseInt($(cdcol).css('paddingRight')));

		$(g.bDiv).before(g.cDrag);

		var cdheight = $(g.bDiv).height();
		var hdheight = $(g.hDiv).height();

		$(g.cDrag).css({top: -hdheight + 'px'});

		$('thead tr:first th',g.hDiv).each
			(
			 	function ()
					{
						var cgDiv = document.createElement('div');
						$(g.cDrag).append(cgDiv);
						if (!p.cgwidth) p.cgwidth = $(cgDiv).width();
						$(cgDiv).css({height: cdheight + hdheight})
						.mousedown(function(e){g.dragStart('colresize',e,this);})
						;
						if ($.browser.msie&&$.browser.version<7.0)
						{
							g.fixHeight($(g.gDiv).height());
							$(cgDiv).hover(
								function ()
								{
								g.fixHeight();
								$(this).addClass('dragging')
								},
								function () { if (!g.colresize) $(this).removeClass('dragging') }
							);
						}
					}
			);
		//g.rePosDrag()
		}


		//add strip
        if (p.striped)
        {
            $('tbody tr:odd', g.bDiv).addClass('erow');
        }

        if (p.resizable && p.height !='auto')
        {
            g.vDiv.className = 'vGrip';
            $(g.vDiv)
                    .mousedown(function (e) { g.dragStart('vresize',e); })
                    .html('<span></span>');
            $(g.bDiv).after(g.vDiv);
        }

        if (p.resizable && p.width !='auto' && !p.nohresize)
        {
            g.rDiv.className = 'hGrip';
            $(g.rDiv)
                    .mousedown(function (e) {g.dragStart('vresize',e,true);})
                    .html('<span></span>')
                    .css('height',$(g.gDiv).height())
                    ;
            if ($.browser.msie&&$.browser.version<7.0)
            {
                $(g.rDiv).hover(function(){$(this).addClass('hgOver');},function(){$(this).removeClass('hgOver');});
            }
            $(g.gDiv).append(g.rDiv);
        }

		// add pager
		if (p.usepager || p.showPageStat)
		{
			g.pDiv.className = 'pDiv';
			g.pDiv.innerHTML = '<div class="pDiv2"></div>';
			$(g.bDiv).after(g.pDiv);
			if (p.usepager) {
				var pagerHtml = ' <div class="pGroup"> <div class="pFirst pButton"><span></span></div>' +
                                '<div class="pPrev pButton"><span></span></div> </div> <div class="btnseparator"></div> ' +
                                '<div class="pGroup"><span class="pcontrol">Page <input type="text" size="4" value="1" /> of <span> 1 </span>' +
                                '</span></div> <div class="btnseparator"></div> <div class="pGroup"> <div class="pNext pButton">' +
                                '<span></span></div><div class="pLast pButton"><span></span></div> </div>';
				$('div',g.pDiv).html(pagerHtml);
				// register events for pager
				$('.pReload',g.pDiv).click(function(){g.populate()});
				$('.pFirst',g.pDiv).click(function(){g.changePage('first')});
				$('.pPrev',g.pDiv).click(function(){g.changePage('prev')});
				$('.pNext',g.pDiv).click(function(){g.changePage('next')});
				$('.pLast',g.pDiv).click(function(){g.changePage('last')});
				$('.pcontrol input',g.pDiv).keydown(function(e){if(e.keyCode==13) g.changePage('input')});
				if ($.browser.msie&&$.browser.version<7) $('.pButton',g.pDiv).hover(function(){$(this).addClass('pBtnOver');},function(){$(this).removeClass('pBtnOver');});

				// add 'rows per page' combobox
				if (p.useRp)
				{
				var opt = "";
				for (var nx=0;nx<p.rpOptions.length;nx++)
				{
					if (p.rp == p.rpOptions[nx]) sel = 'selected="selected"'; else sel = '';
					 opt += "<option value='" + p.rpOptions[nx] + "' " + sel + " >" + p.rpOptions[nx] + "&nbsp;&nbsp;</option>";
				};
				$('.pDiv2',g.pDiv).prepend("<div class='pGroup'><select name='rp'>"+opt+"</select></div> <div class='btnseparator'></div>");
				$('select',g.pDiv).change(
						function ()
						{
							if (p.onRpChange)
								p.onRpChange(+this.value);
							else
								{
								p.newp = 1;
								p.rp = +this.value;
								g.populate();
								}
						}
					);
				}
			}
			// add page statistics
			if (p.showPageStat) {
				var pageStatHtml = ' <div class="btnseparator"></div> <div class="pGroup"> <div class="pReload pButton"><span></span></div> </div> <div class="btnseparator"></div> <div class="pGroup"><span class="pPageStat"></span></div>';
				$('.pDiv2',g.pDiv).append(pageStatHtml);
				$('.pReload',g.pDiv).click(function(){g.populate()});
			}
			//add search button
			if (p.searchitems)
			{
				$('.pDiv2',g.pDiv).prepend("<div class='pGroup'> <div class='pSearch pButton'><span></span></div> </div>  <div class='btnseparator'></div>");
				$('.pSearch',g.pDiv).click(function(){$(g.sDiv).slideToggle('fast',function(){$('.sDiv:visible input:first',g.gDiv).trigger('focus');});});
				//add search box
				g.sDiv.className = 'sDiv';

				var sitems = p.searchitems;

				var sopt = "";
				for (var s = 0; s < sitems.length; s++)
				{
					if (p.qtype=='' && sitems[s].isdefault==true)
					{
					p.qtype = sitems[s].name;
					var sel = 'selected="selected"';
					} else sel = '';
					sopt += "<option value='" + sitems[s].name + "' " + sel + " >" + sitems[s].display + "&nbsp;&nbsp;</option>";
				}

				if (p.qtype=='') p.qtype = sitems[0].name;

				$(g.sDiv).append("<div class='sDiv2'>Quick Search <input type='text' size='30' name='q' class='qsbox' /> <select name='qtype'>"+sopt+"</select> <input type='button' value='Clear' /></div>");

				$('input[name=q],select[name=qtype]',g.sDiv).keydown(function(e){if(e.keyCode==13) g.doSearch()});
				$('input[value=Clear]',g.sDiv).click(function(){$('input[name=q]',g.sDiv).val(''); p.query = ''; g.doSearch(); });
				$(g.bDiv).after(g.sDiv);

			}

		}
		$(g.pDiv,g.sDiv).append("<div style='clear:both'></div>");

		// add title
		if (p.title)
		{
			g.mDiv.className = 'mDiv';
			g.mDiv.innerHTML = '<div class="ftitle">'+p.title+'</div>';
			$(g.gDiv).prepend(g.mDiv);
			if (p.showTableToggleBtn)
				{
					$(g.mDiv).append('<div class="ptogtitle" title="' + p.mintablemsg + '"><span></span></div>');
					$('div.ptogtitle',g.mDiv).click
					(
					 	function ()
							{
								$(g.gDiv).toggleClass('hideBody');
								$(this).toggleClass('vsble');
							}
					);
				}
			//g.rePosDrag();
		}

		//setup cdrops
		g.cdropleft = document.createElement('span');
		g.cdropleft.className = 'cdropleft';
		g.cdropright = document.createElement('span');
		g.cdropright.className = 'cdropright';

		//add block
		g.block.className = 'gBlock';
		var gh = $(g.bDiv).height();
		var gtop = g.bDiv.offsetTop;
		$(g.block).css(
		{
			width: g.bDiv.style.width,
			height: gh,
			background: 'white',
			position: 'relative',
			marginBottom: (gh * -1),
			zIndex: 1,
			top: gtop,
			left: '0px'
		}
		);
		$(g.block).fadeTo(0,p.blockOpacity);

		// add column control
		if ($('th',g.hDiv).length)
		{

			g.nDiv.className = 'nDiv';
			g.nDiv.innerHTML = "<table cellpadding='0' cellspacing='0'><tbody></tbody></table>";
			$(g.nDiv).css(
			{
				marginBottom: (gh * -1),
				display: 'none',
				top: gtop
			}
			).noSelect()
			;

			var cn = 0;


			$('th div',g.hDiv).each
			(
			 	function ()
					{
						var kcol = $("th[axis='col" + cn + "']",g.hDiv)[0];
						var chk = 'checked="checked"';
						if (kcol.style.display=='none') chk = '';

						$('tbody',g.nDiv).append('<tr><td class="ndcol1"><input type="checkbox" '+ chk +' class="togCol" value="'+ cn +'" /></td><td class="ndcol2">'+this.innerHTML+'</td></tr>');
						cn++;
					}
			);

			if ($.browser.msie&&$.browser.version<7.0)
				$('tr',g.nDiv).hover
				(
				 	function () {$(this).addClass('ndcolover');},
					function () {$(this).removeClass('ndcolover');}
				);

			$('td.ndcol2',g.nDiv).click
			(
			 	function ()
					{
						if ($('input:checked',g.nDiv).length<=p.minColToggle&&$(this).prev().find('input')[0].checked) return false;
						return g.toggleCol($(this).prev().find('input').val());
					}
			);

			$('input.togCol',g.nDiv).click
			(
			 	function ()
					{

						if ($('input:checked',g.nDiv).length<p.minColToggle&&!this.checked) {
                            return false;
                        }
						$(this).parent().next().trigger('click');
						//return false;
					}
			);


			$(g.gDiv).prepend(g.nDiv);

			$(g.nBtn).addClass('nBtn')
			.html('<div></div>')
			.attr('title',p.hidecolmsg)
			.click
			(
			 	function ()
				{
			 	$(g.nDiv).slideToggle('fast'); return true;
				}
			);

			if (p.showToggleBtn) $(g.gDiv).prepend(g.nBtn);

		}

		// add date edit layer
		$(g.iDiv)
		.addClass('iDiv')
		.css({display:'none'})
		;
		$(g.bDiv).append(g.iDiv);

		// add flexigrid events
		$(g.bDiv)
		.hover(function(){$(g.nDiv).hide();$(g.nBtn).hide();},function(){if (g.multisel) g.multisel = false;})
		;
		$(g.gDiv)
		.hover(function(){},function(){$(g.nDiv).hide();$(g.nBtn).hide();})
		;

		// pinkhominid (2008.09.20): ie leak fix start
		//add document events
		// we need the document here, otherwise the dragging is restricted
		// to the selected div, e.g $(g.gDiv)
		$(document)
        .mousemove(mousemove)
        .mouseup(mouseup)
        .mouseenter(hoverover)
        .mouseleave(hoverout);

        function mousemove(e) {
            g.dragMove(e);
        }
        function mouseup() {
            g.dragEnd();
        }
        function hoverover(){}
        function hoverout() {
            g.dragEnd();
        }

        g.cleanup = function () {
            // Unbind events listeners attached outside flexigrid gDiv
            $(document)
                .unbind('mousemove', mousemove)
                .unbind('mouseup', mouseup)
                .unbind('mouseenter', hoverover)
                .unbind('mouseleave', hoverout);
            // Unbind all event listeners inside flexigrid gDiv
            $(t.grid.gDiv).remove();

            // Help GC
            p.onToggleCol = null;
            p.onChangeSort =  null; // using custom change sort function
            p.preProcess = null; // using custom pre processing before addData function
            p.onSuccess = null; // using custom validate after addData function
            p.onChangePage = null; // using custom change page function
            p.onSubmit = null; // using a custom populate function
            p.onPopulateCallback = null; // using a custom populate callback function with parsed params
            p.onDragCol =  null; // using a custom on column dragdrop callback function
            p.onResizeCol = null; // using a custom on column resizing callback function
            p.onResizeGrid = null; // using a custom on grid resizing callback function
            p = null;
            g = null;
            t.grid = null;
            t.p = null;
            t = null;
        };
		// pinkhominid (2008.09.20): ie leak fix end

        /**
         * Method to focus and blur the flexigrid table.
         */
        g.focus = function (focusState) {
        	// FOCUS on first row
        	if (p.debug && window.console && window.console.log) {
				console.log("FlexFocus: focus is " + focusState);
        	}
        	// if flexigrid is busy we will trigger the focus after its finished.
        	if (this.loading) {
        		g.lazyFocus = g.focus;
        	} else {
                g.lazyFocus = null;
                if (!$("table tbody tr").hasClass('trSelected')) {
		    		g.selectedRow = $("table tbody tr:first-child", g.bDiv);
					if (focusState) {
						g.selectedRow.addClass('trSelected');
					} else {
		                $("table tbody tr").removeClass('trSelected');
		           	}
        		}
        	}
        };

        /**
         * Method to remote control the flexigrid via keycodes.
         */
        g.remoteControl = function (keycode) {
        	if (p.debug && window.console && window.console.log) {
        		var startTime = new Date();
        		console.log('Triggered remoteControl keycode: ' + keycode);
        	}
        	if (keycode == 13) {
        		// press enter to trigger the same as mouse click (up)
        		g.selectedRow.trigger("mouseup");
        	} else if (keycode == 40) {
        		// press arrow down
        		var nextselectedRow = g.selectedRow.next();
        		if (nextselectedRow.is('tr')) {
		            g.selectedRow = nextselectedRow;
	        		g.selectedRow.toggleClass('trSelected');
	        		if (p.singleSelect) {
		                g.selectedRow.siblings().removeClass('trSelected');
		            }
		            var rowsHeight = 0;
					nextselectedRow.prevAll().each(function () {
					        rowsHeight += $(this).height();
					});
		            if ($(g.bDiv).height()/2.3 < rowsHeight)
		            	g.bDiv.scrollTop = g.bDiv.scrollTop + nextselectedRow.height();
        		}
        	} else if (keycode == 38) {
        		// press arrow up
        		var prevselectedRow = g.selectedRow.prev();
        		if (prevselectedRow.is('tr')) {
		            g.selectedRow = prevselectedRow;
	        		g.selectedRow.toggleClass('trSelected');
	        		if (p.singleSelect) {
		                g.selectedRow.siblings().removeClass('trSelected');
		            }
		            var rowsHeight = 0;
					prevselectedRow.nextAll().each(function () {
					        rowsHeight += $(this).height();
					});
		            if ($(g.bDiv).height()/2.3 < rowsHeight)
		            	g.bDiv.scrollTop = g.bDiv.scrollTop - prevselectedRow.height();
        		}
        	} else if (keycode == 39) {
        		// press arrow right
        		g.bDiv.scrollLeft = g.bDiv.scrollLeft + 50;
        		g.scroll();
        	} else if (keycode == 37) {
        		// press arrow left
        		g.bDiv.scrollLeft = g.bDiv.scrollLeft - 50;
        		g.scroll();
        	}
        	if (p.debug && window.console && window.console.log) {
        		console.log('Processed scrolltop: ' + g.bDiv.scrollTop + ', cHeight: ' + $(g.bDiv).height() + ' in :' + (new Date() - startTime) + 'ms');
        	}
        	return true;
        };

        /**
         * Method to multisort the flexigrid on demand.
         */
		g.multiSort = function (sortModel, columnModel, tableModel) {
	  		var sortingColumns = sortModel.columns;

	  		var columnsToSort = new Array();
	  		for (idx = 0; idx < sortingColumns.length; idx++) {
	  			var sortingColumn = sortingColumns[idx];
		  		for (var adx = 0; adx < columnModel.columns.length; adx++) {
		  			if(columnModel.columns[adx].name == sortingColumn.columnId){
		  				columnsToSort.push(new Object({
		  					index: adx,
		  					order: sortingColumn.sortOrder
		  				}));
		  			}
		  		}
	  		}
	  		columnsToSort.reverse();
	  		if (p.debug && window.console && window.console.log) {
	  			console.log('Sorting columns: ' + columnsToSort);
	  		}
	  		var allRows = new Array();
	  		for (var idx = 0; idx < tableModel.pages.length; idx++) {
	  			allRows = allRows.concat(tableModel.pages[idx].rows);
	  		}
	  		var delimiterRegExp = new RegExp('[\\' + p.digitGroupDL + ']', 'g');
            var decimalDelimiterRegExp = new RegExp('[\\' + p.decimalDelimiter + ']', 'g');
	  		allRows = multiSorter(columnsToSort, allRows);
	  		// implement paging here...
	  		var firstPage = tableModel.pages[0];
            firstPage.rows = allRows;
	  		return tableModel;

	  		/**
	  		 * A method to sort rows using multiple columns.
	  		 */
			function multiSorter (columns, rows) {
				if (p.debug) {
					var startTime = new Date();
				}
				for (idx = 0; idx < columns.length; idx++) {
					var columnIdx = columns[idx].index;
					var sortOrder = columns[idx].order;
					if (p.debug && window.console && window.console.log) {
						console.log('Sorting column: ' + columnIdx + ', ' + sortOrder);
					}
			  		rows.sort(alphaNumericSorter);
				}
		  		if (p.debug && window.console && window.console.log) {
					var nowTime = new Date();
					console.log('Duration of multiSort on ' + rows.length
						+ ' rows :' + (nowTime - startTime) + 'ms');
				}
				return rows;

		  		function alphaNumericSorter (row1, row2) {
		  			var row1Cell = row1.cell[columnIdx];
		  			var row2Cell = row2.cell[columnIdx];

		  			// undefined rows
		  			if (!row1Cell && !row2Cell) {
	  					return 0;// test for undefined rows
	  				} else if (!row1Cell && row2Cell) {
	  					return -1;// test for undefined row1
	  				} else if (row1Cell && !row2Cell) {
	  					return 1;// test for undefined row2
	  				}
		  			if (isDigit(row1Cell) && isDigit(row2Cell)) {
		  				// convert into num value the fastest way,
		  				// see http://www.jibbering.com/faq/faq_notes/type_convert.html
		  				if (typeof row1Cell != 'number')
		  					var row1Num = row1Cell.replace(delimiterRegExp,'');
                           // after replacing the delimiter, we make sure to have a '.' as delimiter for Decimal-Values
                          if(typeof(row1Num) != 'undefined') // can happen...
                          {
                              row1Num = (+row1Num.replace(decimalDelimiterRegExp, '.'));
                          }

		  				if (typeof row2Cell != 'number')
		  					var row2Num = row2Cell.replace(delimiterRegExp,'');
                           // after replacing the delimiter, we make sure to have a '.' as delimiter for Decimal-Values
                           if(typeof(row2Num) != 'undefined') // can happen...
                          {
                             row2Num = row2Num.replace(decimalDelimiterRegExp, '.');
                          }
		  				if (p.debug && window.console && window.console.log) {
		  					console.log('Tested row type = "number" ' + row1Num + ' to ' + row2Num);
		  				}
		  				var result = sortOrder == 'asc' ? row1Num - row2Num : row2Num - row1Num;
			  			return result;
		  			}
		  			// string rows
		  			else {
		  				if (p.debug && window.console && window.console.log) {
		  					console.log('Tested row type = "string" '+ row1Cell + ' to ' + row2Cell);
		  				}
		  				if (row1Cell == row2Cell) {
		  					return 0;
		  				}
		  				if (sortOrder == 'asc') {
		  					return (row1Cell < row2Cell) ? -1 : 1;
		  				} else {
		  					return (row1Cell > row2Cell) ? -1 : 1;
		  				}
		  			}

				}
	  			function isDigit(s) {
					if (typeof s == 'number') return true;
					var DECIMAL = '\\' + p.digitGroupDL;
                    var DECIMAL_DELIMITER = '\\' + p.decimalDelimiter;
                    var exp = '(^([-+]?[\\d'+ DECIMAL + DECIMAL_DELIMITER + ']*)$)';
					return RegExp(exp).test($.trim(s));
				}

			}
		};
        /**
         * Method to force populating the flexigrid again by setting the loading mode
         * to false. The loading mode is normally used while rendering.
         */
        g.reload = function (){
            g.loading = false;
            g.populate()
        };

		//browser adjustments
		if ($.browser.msie&&$.browser.version<7.0)
		{
			$('.hDiv,.bDiv,.mDiv,.pDiv,.vGrip,.tDiv, .sDiv',g.gDiv)
			.css({width: '100%'});
			$(g.gDiv).addClass('ie6');
			if (p.width!='auto') $(g.gDiv).addClass('ie6fullwidthbug');
		}

		g.rePosDrag();
		g.fixHeight();

		//make grid functions accessible
		t.p = p;
		t.grid = g;

        // Load data if possible and enabled.
        if (p.url && p.autoload) {
            g.populate();
        } else {
            // If Debugging is enabled record the start time of the rendering process.
            if (p.debug) {
                var startTime = new Date();
            }
            // Make this grid list busy for the user.
            g.setBusy(true);

	        // ECHO3: call our special autosize columns which assigns max width (by bsc)
	        // g.autoColumnWidth.call(g);

            /**
             * This method is used to finalize the rendering of the data to the body if the grid list.
             * @return (void)
             */
            function finalizeRendering() {
                g.setBusy(false);
                $('tbody', g.bDiv).show();
                if (p.debug && window.console && window.console.log) {
                    var nowTime = new Date();
                    console.log('Duration of rendering data of type "inlineHtml": ' + (nowTime - startTime) + 'ms');
                }
            }

            // Add tr and td properties

            // What is going on here? Because of many rows we have to render, we do not
            // iterate with a regular foreach method. We make a pseudo asynchron process with
            // the setTimeout method. We do better to do this because in other way we will
            // force a lagging of the whole browser. In the worst case the user will get a
            // dialog box of an "endless looping javaScript".

            // Set initial properties for rendering the data.
            var qth = $('thead tr:first th',g.hDiv);
            var rows = $('tbody tr', g.bDiv);
            var rowIndex = 0;
            function doRow() {
                // Only if there are more rows we will render a next row.
                if (rowIndex < rows.length) {
                    var tr = rows[rowIndex];
                    // Paranoid I know but it possible that there is an array selected with
                    // null entries.
                    if (tr) {
                        var qtr = $(tr);
                        var i = 0;
                        $('td', tr).each(function() {
                            var header = false;
                            if (qth.length > i) {
                                header = qth[i] || false;
                            }
                            g.addCellProp(this, tr, this.innerHTML, header);
                            i++;
                        });
                        g.addRowProp(qtr);
                        // Prepare the next step.
                        rowIndex++;
                        setTimeout(doRow, 1);
                    } else {
                        finalizeRendering();
                    }
                } else {
                    finalizeRendering();
                }
            }
            // Start the pseudo asynchron iteration.
            setTimeout(doRow, 1);
        }
        return t;
	};

	/* COMMENT-ECHO3: Not useful in echo3! changed to true, was false */
	//var docloaded = true;

	//$(document).ready(function () {docloaded = true} );

	$.fn.flexigrid = function(p) {

		return this.each( function() {
				/*if (!docloaded)
				{
					$(this).hide();
					var t = this;
					$(document).ready
					(
						function ()
						{
						$.addFlex(t,p);
						}
					);
				} else {*/
					$.addFlex(this,p);
				//}
			});

	}; //end flexigrid

	$.fn.flexReload = function(p) { // function to reload grid

		return this.each( function() {
				if (this.grid){
                    return this.grid.reload();
				}
			});

	}; //end flexReload

	$.fn.flexOptions = function(p) { //function to update general options

		return this.each( function() {
				if (this.grid) $.extend(this.p,p);
			});

	}; //end flexOptions

	$.fn.flexToggleCol = function(cid,visible) { // function to reload grid

		return this.each( function() {
				if (this.grid) this.grid.toggleCol(cid,visible);
			});

	}; //end flexToggleCol

	$.fn.flexAddData = function(data) { // function to add data to grid

		return this.each( function() {
				if (this.grid) this.grid.addData(data);
			});

	};

	$.fn.noSelect = function(p) { //no select plugin by me :-)

		if (p == null)
			var prevent = true;
		else
			prevent = p;

		if (prevent) {

		return this.each(function ()
			{
				if ($.browser.msie||$.browser.safari) $(this).bind('selectstart',function(){return false;});
				else if ($.browser.mozilla)
					{
						$(this).css('MozUserSelect','none');
						$('body').trigger('focus');
					}
				else if ($.browser.opera) $(this).bind('mousedown',function(){return false;});
				else $(this).attr('unselectable','on');
			});

		} else {


		return this.each(function ()
			{
				if ($.browser.msie||$.browser.safari) $(this).unbind('selectstart');
				else if ($.browser.mozilla) $(this).css('MozUserSelect','inherit');
				else if ($.browser.opera) $(this).unbind('mousedown');
				else $(this).removeAttr('unselectable','on');
			});

		}

	}; //end noSelect

    $.fn.flexDestroy = function() {
        return this.each( function() {
                if (this.grid) {
                    var isDebug = this.p.debug;
                    if (isDebug) {
                        var startTime = new Date();
                    }
                    this.grid.cleanup();
                    if (isDebug && window.console && window.console.log) {
                        console.log('flexDestroy took :' + (new Date() - startTime) + 'ms');
                    }
                }
            });
    };

    $.fn.flexMultiSort = function(sortModel, colModel, tableModel) {
        return this.each( function() {
                if (this.grid) {
                	this.grid.multiSort(sortModel, colModel, tableModel)
                };
            });
    };

    $.fn.flexFocus = function(focusState) {
        return this.each( function() {
                if (this.grid) {
                	this.grid.focus(focusState)
                };
            });
    };

    $.fn.flexRemoteControl = function(keycode) {
        return this.each( function() {
                if (this.grid) {
                	this.grid.remoteControl(keycode)
                };
            });
    };
})(jQuery);
/**
 * Notifier jquery plugin.
 * Inspired by noticeMsg 1.0 (http://hiromitz.jimdo.com/)
 *
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Depends:
 *   jquery.js, Version >1.3.2
 *
 * Copyright (c) 2010 Echolot (echolot.assembla.com)
 *
 * KNOWN ISSUES:
 * - jquery 1.3.2: the message div might not fade out (but directly disappear)
 */
(function($){
    $.addNotifier = function(e, msgopt) {
        var POS_CENTER = 'center';
        var POS_TOPRIGHT = 'topright';
        var POS_BOTTOMRIGHT = 'bottomright';
        var POS_BOTTOMLEFT = 'bottomleft';
        var POS_TOPLEFT = 'topleft';
        var POS_BOTTOMCENTER = 'bottomcenter';
        var POS_TOPCENTER = 'topcenter';

        var NTF_CONTAINER = 'ntf-container';
        var NTF_CLOSE = "ntfClose";

        var msg = {};
        var defaults = {
            title: "", // title: 'Warning'
            text: "",  // text: 'Just a warning'
            icon: false, // icon: 'alert.png'
            position: POS_CENTER, // the class of the notifier position (center|topright|bottomright)
            width: 300, // the width of the message box
            height: false, // the height of the message box
            duration: 4000, // time the message will be shown before it disappears
            sticky: false, // if 'true' the message will disappear only on click
            humanized: false, // if 'true' the message will disappear on mouse move            
            hoverInterrupt: true, // if 'true' the message will not fade if the user hovers the message (with the mouse)
            fade: 'slow', // the speed of the disappear animation
            background: '#333333', // the background color of the message box
            border: 'white solid 2px', //the border surrounding the message box
            padding: '5px', // the insets surrounding the message box
            hFont: {
                color: 'white',
                sizePx: 14,
                face: 'Helvetica,Arial,sans-serif',
                weight: 'bold'
            },
            pFont: { // the font used for the text
                color: 'white',
                sizePx: 10,
                face: 'Helvetica,Arial,sans-serif',
                weight: 'normal'
            },
            opacity: '0.8', // how translucent the box is (0.0 not visible to 1.0 solid)
            borderRadius: '7px', // the radius of the rounded courners,
            overlayed: false, // if true, the message will have a blocking dark overlay avoiding any interaction
            msgId: "id not set", // identifies the message (used in callbacks)
            btnShow: false, // shows a button on the notifier
            btnText: 'Details', // the text on the button
            onBtnClick: false // the function called if the user clicks the button            
        };
        // merge defaults and options without modifying the defaults
        var m = $.extend(true, msg, defaults, msgopt);

        var ntfCross = 'cursor: pointer;float: right;font-size: 12px; font-weight: bold; margin-top: -4px; padding: 2px; text-decoration: none; text-shadow: 0 1px 1px #FFFFFF;';
        var ntfClose = 'color: ' + m.hFont.color + ';';
        var tmplIconMsg = '<a id="'+NTF_CLOSE+'" href="#" style="' + ntfCross + ntfClose + '">x</a><div style="float:left;margin:0 10px 0 0"><img src="#{icon}" alt="An icon." style="float: left;"></div><h1 style="margin: 0;padding: 0;">#{title}</h1><p>#{text}</p>';
        var tmplTextMsg = '<a id="'+NTF_CLOSE+'" href="#" style="' + ntfCross + ntfClose + '">x</a><h1 style="text-align: center;margin: 0;padding: 0;">#{title}</h1><p style="text-align: left;">#{text}</p>';

        var n = {
            oDiv: null, // the overlay div
            container: null, // the body or whatever
            mDiv: null, // the message div
            gDiv: null, // the global div for stacking messages
            btnDiv: null, // a custom button

            /* Creates and shows a message on the container component. */
            showMsg: function(tpl, params) {
                // replace template values
                var msgHtml = tpl.replace(/#(?:\{|%7B)(.*?)(?:\}|%7D)/g, function($1, $2){
                    return ($2 in params) ? params[$2] : '';
                });

                n.mDiv = document.createElement('div'); // create message
                $(n.mDiv).html(msgHtml).hide();

                if (m.overlayed) { // create overlay
                    n.oDiv = document.createElement("div");                    
                    document.body.appendChild(n.oDiv);
                }
                if (m.btnShow) { // a button under the message
                    n.btnDiv = document.createElement("input");
                    n.btnDiv.type = "button";
                    n.btnDiv.value = m.btnText;                    
                    n.mDiv.appendChild(n.btnDiv);

                    if (m.onBtnClick) {
                        $(n.btnDiv).bind('click', function() {
                            m.onBtnClick.call(this, m.msgId);
                        });
                    }                    
                }

                n.styleMsg();

                n.gDiv.appendChild(n.mDiv);

                $(n.mDiv).fadeIn(m.fade).bind('click', function() {doRemove();});
                if (m.humanized) {
                   $(document).bind('mousemove', function() {doRemove();});
                }

                if (!m.sticky) {
                   var timingId = setTimeout(doRemove, m.duration);
                   if (m.hoverInterrupt) {
                        $(n.mDiv).bind('mouseover', function() {doStopFading(timingId);});
                   }
                }
            },
            /* Styles the message applying all style properties. */
            styleMsg: function() {
                var mDiv = $(n.mDiv);
                var gDiv = $(n.gDiv);
                if (m.overlayed) {
                    gDiv.css({'z-index' :32767});
                    $(n.oDiv).css({
                        'position': 'absolute', 'bottom': 0, 'right': 0,                        
                        'top': 0, 'left': 0, 'display': 'block',
                        'z-index': 32766, 'opacity': '0.5', 'background': '#000000'
                    });
                }

                if (m.position === POS_CENTER || m.position === POS_TOPCENTER || m.position === POS_BOTTOMCENTER) {
                    gDiv.css({
                            'margin-left': -(m.width / 2), 'position': 'absolute', 'left': '50%'});
                    if (m.position === POS_CENTER) {
                        gDiv.css({'top': '50%'});
                        if (m.height) {
                            gDiv.css('margin-top', -(m.height / 2));
                        } else {
                            // okay this can be optimized: the algorithm to calculate the height
                            // calculate content height = ((text.length*font.size)/width)*font.size
                            var cHeight = Math.round(((m.text.length*m.pFont.sizePx)/m.width)*m.pFont.sizePx);
                            gDiv.css('margin-top', -(cHeight / 2));
                        }
                    } else if (m.position === POS_TOPCENTER) {
                        gDiv.css({'top': '7px'});
                    } else if (m.position === POS_BOTTOMCENTER) {
                        gDiv.css({'bottom': '7px'});
                    }
                } else if (m.position === POS_TOPRIGHT) {
                    gDiv.css({
                        'position': 'absolute', 'float': 'right', 'top': '7px', 'right': '7px'});
                } else if (m.position === POS_TOPLEFT) {
                    gDiv.css({
                        'position': 'absolute', 'float': 'left', 'top': '7px', 'left': '7px'});
                } else if (m.position === POS_BOTTOMRIGHT) {
                    gDiv.css({
                        'position': 'absolute', 'float': 'right', 'bottom': '20px', 'right': '7px'});
                } else if (m.position === POS_BOTTOMLEFT) {
                    gDiv.css({
                        'position': 'absolute', 'float': 'left', 'bottom': '20px', 'left': '7px'});
                }
                mDiv.css({
                        'overflow': 'auto',
                        'background': m.background, 'border': m.border,
                        'padding': m.padding,
                        'opacity': m.opacity,'-moz-opacity': m.opacity,'filter': 'alpha(opacity=' + m.opacity * 100 + ')',
                        'border-radius': m.borderRadius,'-o-border-radius': m.borderRadius, '-moz-border-radius': m.borderRadius,'-webkit-border-radius': m.borderRadius,
                        '-moz-box-shadow': '0 0 6px #000','-webkit-box-shadow': '0 0 6px #000','box-shadow': '0 0 6px #000',
                        'width': m.width});
                if (m.height) {
                    mDiv.css('height', m.height);
                }
                if (!m.sticky) {
                    $("#"+NTF_CLOSE, n.mDiv).hide();
                }
                $('p', n.mDiv).css({'color': m.pFont.color, 'font-size': m.pFont.sizePx + "px",
                    'font-family': m.pFont.face, 'font-weight': m.pFont.weight});
                $('h1', n.mDiv).css({'color': m.hFont.color, 'font-size': m.hFont.sizePx + "px",
                    'font-family': m.hFont.face, 'font-weight': m.hFont.weight});
            },

            /* Removes the message and destroys the message and event listener.*/
            remove: function() {
                $(n.mDiv).fadeOut(m.fade, function() {
                    $(n.mDiv).unbind('click').remove();
                    // remove the global div (gDiv) if no children are left
                    if (!n.gDiv.hasChildNodes()) {
                        $(n.gDiv).remove();
                    }                                        
                });

            }
        }; // --- EOF Notifier declaration (n)

        function doRemove() {
            if ($(n.mDiv).is(":visible")) {
                n.remove();
            }
            if (m.humanized) {
                $(document).unbind('mouseover');
            }
            if ($(n.oDiv).is(":visible")) {
                $(n.oDiv).remove();
            }
        }
        function doStopFading(timingId) {
            clearTimeout(timingId);
            $("#"+NTF_CLOSE, n.mDiv).show();
        }
        // init divs
        n.container = e == window || e == document ? document.body : e;

        // find an old 'gDiv' to use (for stacking)
        n.gDiv = $('div.' + NTF_CONTAINER + m.position, n.container).get(0);
        if (!n.gDiv) {
            n.gDiv = document.createElement('div');
            $(n.gDiv).addClass(NTF_CONTAINER + m.position);
            $(n.container).append(n.gDiv);
        }

        // show message by choosing the correct template
        if (m.icon) {
            n.showMsg(tmplIconMsg, m);
        } else {
            n.showMsg(tmplTextMsg, m);
        }
    };

    $.fn.notifier = function(msg) {
       return this.each( function() {
           $.addNotifier(this, msg);
       });
    };
})(jQuery);
/**
 * Raphael 1.5.2 - JavaScript Vector Library
 *
 * Copyright (c) 2010 Dmitry Baranovskiy (http://raphaeljs.com)
 * Licensed under the MIT (http://raphaeljs.com/license.html) license.
 *
 * ------------------------
 *
 * Some details changed to get Opera working - inspired by new Raphael 2.0 Version
 * @author Ralf Enderle
 */
(function () {
    function R() {
        if (R.is(arguments[0], array)) {
            var a = arguments[0],
                    cnv = create[apply](R, a.splice(0, 3 + R.is(a[0], nu))),
                    res = cnv.set();
            for (var i = 0, ii = a[length]; i < ii; i++) {
                var j = a[i] || {};
                elements[has](j.type) && res[push](cnv[j.type]().attr(j));
            }
            return res;
        }
        return create[apply](R, arguments);
    }

    R.version = "1.5.2";
    var separator = /[, ]+/,
            elements = {circle: 1, rect: 1, path: 1, ellipse: 1, text: 1, image: 1},
            formatrg = /\{(\d+)\}/g,
            proto = "prototype",
            has = "hasOwnProperty",
            doc = document,
            win = window,
            oldRaphael = {
                was: Object[proto][has].call(win, "Raphael"),
                is: win.Raphael
            },
            Paper = function () {
                this.customAttributes = {};
            },
            paperproto,
            appendChild = "appendChild",
            apply = "apply",
            concat = "concat",
            supportsTouch = "createTouch" in doc,
            E = "",
            S = " ",
            Str = String,
            split = "split",
            events = "click dblclick mousedown mousemove mouseout mouseover mouseup touchstart touchmove touchend orientationchange touchcancel gesturestart gesturechange gestureend"[split](S),
            touchMap = {
                mousedown: "touchstart",
                mousemove: "touchmove",
                mouseup: "touchend"
            },
            join = "join",
            length = "length",
            lowerCase = Str[proto].toLowerCase,
            math = Math,
            mmax = Math.max,
            mmin = Math.min,
            abs = Math.abs,
            pow = Math.pow,
            PI = Math.PI,
            nu = "number",
            string = "string",
            array = "array",
            toString = "toString",
            fillString = "fill",
            objectToString = Object[proto][toString],
            paper = {},
            push = "push",
            ISURL = /^url\(['"]?([^\)]+?)['"]?\)$/i,
            colourRegExp = /^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgba?\(\s*([\d\.]+%?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\)|hsba?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\)|hsla?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\))\s*$/i,
            isnan = {"NaN": 1, "Infinity": 1, "-Infinity": 1},
            bezierrg = /^(?:cubic-)?bezier\(([^,]+),([^,]+),([^,]+),([^\)]+)\)/,
            round = Math.round,
            setAttribute = "setAttribute",
            toFloat = parseFloat,
            toInt = parseInt,
            ms = " progid:DXImageTransform.Microsoft",
            upperCase = Str[proto].toUpperCase,
            availableAttrs = {blur: 0, "clip-rect": "0 0 1e9 1e9", cursor: "default", cx: 0, cy: 0, fill: "#fff", "fill-opacity": 1, font: '10px "Arial"', "font-family": '"Arial"', "font-size": "10", "font-style": "normal", "font-weight": 400, gradient: 0, height: 0, href: "http://raphaeljs.com/", opacity: 1, path: "M0,0", r: 0, rotation: 0, rx: 0, ry: 0, scale: "1 1", src: "", stroke: "#000", "stroke-dasharray": "", "stroke-linecap": "butt", "stroke-linejoin": "butt", "stroke-miterlimit": 0, "stroke-opacity": 1, "stroke-width": 1, target: "_blank", "text-anchor": "middle", title: "Raphael", translation: "0 0", width: 0, x: 0, y: 0},
            availableAnimAttrs = {along: "along", blur: nu, "clip-rect": "csv", cx: nu, cy: nu, fill: "colour", "fill-opacity": nu, "font-size": nu, height: nu, opacity: nu, path: "path", r: nu, rotation: "csv", rx: nu, ry: nu, scale: "csv", stroke: "colour", "stroke-opacity": nu, "stroke-width": nu, translation: "csv", width: nu, x: nu, y: nu},
            rp = "replace",
            animKeyFrames = /^(from|to|\d+%?)$/,
            commaSpaces = /\s*,\s*/,
            hsrg = {hs: 1, rg: 1},
            p2s = /,?([achlmqrstvxz]),?/gi,
            pathCommand = /([achlmqstvz])[\s,]*((-?\d*\.?\d*(?:e[-+]?\d+)?\s*,?\s*)+)/ig,
            pathValues = /(-?\d*\.?\d*(?:e[-+]?\d+)?)\s*,?\s*/ig,
            radial_gradient = /^r(?:\(([^,]+?)\s*,\s*([^\)]+?)\))?/,
            sortByKey = function (a, b) {
                return a.key - b.key;
            };

    R.type = (win.SVGAngle || doc.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1") ? "SVG" : "VML");
    if (R.type == "VML") {
        var d = doc.createElement("div"),
                b;
        d.innerHTML = '<v:shape adj="1"/>';
        b = d.firstChild;
        b.style.behavior = "url(#default#VML)";
        if (!(b && typeof b.adj == "object")) {
            return R.type = null;
        }
        d = null;
    }
    R.svg = !(R.vml = R.type == "VML");
    Paper[proto] = R[proto];
    paperproto = Paper[proto];
    R._id = 0;
    R._oid = 0;
    R.fn = {};
    R.is = function (o, type) {
        type = lowerCase.call(type);
        if (type == "finite") {
            return !isnan[has](+o);
        }
        return  (type == "null" && o === null) ||
                (type == typeof o && o !== null) ||
                (type == "object" && o === Object(o)) ||
                (type == "array" && Array.isArray && Array.isArray(o)) ||
                objectToString.call(o).slice(8, -1).toLowerCase() == type;
    };
    R.angle = function (x1, y1, x2, y2, x3, y3) {
        if (x3 == null) {
            var x = x1 - x2,
                    y = y1 - y2;
            if (!x && !y) {
                return 0;
            }
            return ((x < 0) * 180 + math.atan(-y / -x) * 180 / PI + 360) % 360;
        } else {
            return R.angle(x1, y1, x3, y3) - R.angle(x2, y2, x3, y3);
        }
    };
    R.rad = function (deg) {
        return deg % 360 * PI / 180;
    };
    R.deg = function (rad) {
        return rad * 180 / PI % 360;
    };
    R.snapTo = function (values, value, tolerance) {
        tolerance = R.is(tolerance, "finite") ? tolerance : 10;
        if (R.is(values, array)) {
            var i = values.length;
            while (i--) if (abs(values[i] - value) <= tolerance) {
                return values[i];
            }
        } else {
            values = +values;
            var rem = value % values;
            if (rem < tolerance) {
                return value - rem;
            }
            if (rem > values - tolerance) {
                return value - rem + values;
            }
        }
        return value;
    };
    function createUUID() {
        // http://www.ietf.org/rfc/rfc4122.txt
        var s = [],
                i = 0;
        for (; i < 32; i++) {
            s[i] = (~~(math.random() * 16))[toString](16);
        }
        s[12] = 4;  // bits 12-15 of the time_hi_and_version field to 0010
        s[16] = ((s[16] & 3) | 8)[toString](16);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
        return "r-" + s[join]("");
    }

    R.setWindow = function (newwin) {
        win = newwin;
        doc = win.document;
    };
    // colour utilities
    var toHex = function (color) {
        if (R.vml) {
            // http://dean.edwards.name/weblog/2009/10/convert-any-colour-value-to-hex-in-msie/
            var trim = /^\s+|\s+$/g;
            var bod;
            try {
                var docum = new ActiveXObject("htmlfile");
                docum.write("<body>");
                docum.close();
                bod = docum.body;
            } catch(e) {
                bod = createPopup().document.body;
            }
            var range = bod.createTextRange();
            toHex = cacher(function (color) {
                try {
                    bod.style.color = Str(color)[rp](trim, E);
                    var value = range.queryCommandValue("ForeColor");
                    value = ((value & 255) << 16) | (value & 65280) | ((value & 16711680) >>> 16);
                    return "#" + ("000000" + value[toString](16)).slice(-6);
                } catch(e) {
                    return "none";
                }
            });
        } else {
            var i = doc.createElement("i");
            i.title = "Rapha\xebl Colour Picker";
            i.style.display = "none";
            doc.body[appendChild](i);
            toHex = cacher(function (color) {
                i.style.color = color;
                return doc.defaultView.getComputedStyle(i, E).getPropertyValue("color");
            });
        }
        return toHex(color);
    },
            hsbtoString = function () {
                return "hsb(" + [this.h, this.s, this.b] + ")";
            },
            hsltoString = function () {
                return "hsl(" + [this.h, this.s, this.l] + ")";
            },
            rgbtoString = function () {
                return this.hex;
            };
    R.hsb2rgb = function (h, s, b, o) {
        if (R.is(h, "object") && "h" in h && "s" in h && "b" in h) {
            b = h.b;
            s = h.s;
            h = h.h;
            o = h.o;
        }
        return R.hsl2rgb(h, s, b / 2, o);
    };
    R.hsl2rgb = function (h, s, l, o) {
        if (R.is(h, "object") && "h" in h && "s" in h && "l" in h) {
            l = h.l;
            s = h.s;
            h = h.h;
        }
        if (h > 1 || s > 1 || l > 1) {
            h /= 360;
            s /= 100;
            l /= 100;
        }
        var rgb = {},
                channels = ["r", "g", "b"],
                t2, t1, t3, r, g, b;
        if (!s) {
            rgb = {
                r: l,
                g: l,
                b: l
            };
        } else {
            if (l < .5) {
                t2 = l * (1 + s);
            } else {
                t2 = l + s - l * s;
            }
            t1 = 2 * l - t2;
            for (var i = 0; i < 3; i++) {
                t3 = h + 1 / 3 * -(i - 1);
                t3 < 0 && t3++;
                t3 > 1 && t3--;
                if (t3 * 6 < 1) {
                    rgb[channels[i]] = t1 + (t2 - t1) * 6 * t3;
                } else if (t3 * 2 < 1) {
                    rgb[channels[i]] = t2;
                } else if (t3 * 3 < 2) {
                    rgb[channels[i]] = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
                } else {
                    rgb[channels[i]] = t1;
                }
            }
        }
        rgb.r *= 255;
        rgb.g *= 255;
        rgb.b *= 255;
        rgb.hex = "#" + (16777216 | rgb.b | (rgb.g << 8) | (rgb.r << 16)).toString(16).slice(1);
        R.is(o, "finite") && (rgb.opacity = o);
        rgb.toString = rgbtoString;
        return rgb;
    };
    R.rgb2hsb = function (red, green, blue) {
        if (green == null && R.is(red, "object") && "r" in red && "g" in red && "b" in red) {
            blue = red.b;
            green = red.g;
            red = red.r;
        }
        if (green == null && R.is(red, string)) {
            var clr = R.getRGB(red);
            red = clr.r;
            green = clr.g;
            blue = clr.b;
        }
        if (red > 1 || green > 1 || blue > 1) {
            red /= 255;
            green /= 255;
            blue /= 255;
        }
        var max = mmax(red, green, blue),
                min = mmin(red, green, blue),
                hue,
                saturation,
                brightness = max;
        if (min == max) {
            return {h: 0, s: 0, b: max, toString: hsbtoString};
        } else {
            var delta = (max - min);
            saturation = delta / max;
            if (red == max) {
                hue = (green - blue) / delta;
            } else if (green == max) {
                hue = 2 + ((blue - red) / delta);
            } else {
                hue = 4 + ((red - green) / delta);
            }
            hue /= 6;
            hue < 0 && hue++;
            hue > 1 && hue--;
        }
        return {h: hue, s: saturation, b: brightness, toString: hsbtoString};
    };
    R.rgb2hsl = function (red, green, blue) {
        if (green == null && R.is(red, "object") && "r" in red && "g" in red && "b" in red) {
            blue = red.b;
            green = red.g;
            red = red.r;
        }
        if (green == null && R.is(red, string)) {
            var clr = R.getRGB(red);
            red = clr.r;
            green = clr.g;
            blue = clr.b;
        }
        if (red > 1 || green > 1 || blue > 1) {
            red /= 255;
            green /= 255;
            blue /= 255;
        }
        var max = mmax(red, green, blue),
                min = mmin(red, green, blue),
                h,
                s,
                l = (max + min) / 2,
                hsl;
        if (min == max) {
            hsl = {h: 0, s: 0, l: l};
        } else {
            var delta = max - min;
            s = l < .5 ? delta / (max + min) : delta / (2 - max - min);
            if (red == max) {
                h = (green - blue) / delta;
            } else if (green == max) {
                h = 2 + (blue - red) / delta;
            } else {
                h = 4 + (red - green) / delta;
            }
            h /= 6;
            h < 0 && h++;
            h > 1 && h--;
            hsl = {h: h, s: s, l: l};
        }
        hsl.toString = hsltoString;
        return hsl;
    };
    R._path2string = function () {
        return this.join(",")[rp](p2s, "$1");
    };
    function cacher(f, scope, postprocessor) {
        function newf() {
            var arg = Array.prototype.slice.call(arguments, 0),
                    args = arg.join("\u2400"),
                    cache = newf.cache = newf.cache || {},
                    count = newf.count = newf.count || [];
            if (cache[has](args)) {
                return postprocessor ? postprocessor(cache[args]) : cache[args];
            }
            count[length] >= 1e3 && delete cache[count.shift()];
            count.push(args);
            cache[args] = f[apply](scope, arg);
            return postprocessor ? postprocessor(cache[args]) : cache[args];
        }

        return newf;
    }

    R.getRGB = cacher(function (colour) {
        if (!colour || !!((colour = Str(colour)).indexOf("-") + 1)) {
            return {r: -1, g: -1, b: -1, hex: "none", error: 1};
        }
        if (colour == "none") {
            return {r: -1, g: -1, b: -1, hex: "none"};
        }
        !(hsrg[has](colour.toLowerCase().substring(0, 2)) || colour.charAt() == "#") && (colour = toHex(colour));
        var res,
                red,
                green,
                blue,
                opacity,
                t,
                values,
                rgb = colour.match(colourRegExp);
        if (rgb) {
            if (rgb[2]) {
                blue = toInt(rgb[2].substring(5), 16);
                green = toInt(rgb[2].substring(3, 5), 16);
                red = toInt(rgb[2].substring(1, 3), 16);
            }
            if (rgb[3]) {
                blue = toInt((t = rgb[3].charAt(3)) + t, 16);
                green = toInt((t = rgb[3].charAt(2)) + t, 16);
                red = toInt((t = rgb[3].charAt(1)) + t, 16);
            }
            if (rgb[4]) {
                values = rgb[4][split](commaSpaces);
                red = toFloat(values[0]);
                values[0].slice(-1) == "%" && (red *= 2.55);
                green = toFloat(values[1]);
                values[1].slice(-1) == "%" && (green *= 2.55);
                blue = toFloat(values[2]);
                values[2].slice(-1) == "%" && (blue *= 2.55);
                rgb[1].toLowerCase().slice(0, 4) == "rgba" && (opacity = toFloat(values[3]));
                values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
            }
            if (rgb[5]) {
                values = rgb[5][split](commaSpaces);
                red = toFloat(values[0]);
                values[0].slice(-1) == "%" && (red *= 2.55);
                green = toFloat(values[1]);
                values[1].slice(-1) == "%" && (green *= 2.55);
                blue = toFloat(values[2]);
                values[2].slice(-1) == "%" && (blue *= 2.55);
                (values[0].slice(-3) == "deg" || values[0].slice(-1) == "\xb0") && (red /= 360);
                rgb[1].toLowerCase().slice(0, 4) == "hsba" && (opacity = toFloat(values[3]));
                values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
                return R.hsb2rgb(red, green, blue, opacity);
            }
            if (rgb[6]) {
                values = rgb[6][split](commaSpaces);
                red = toFloat(values[0]);
                values[0].slice(-1) == "%" && (red *= 2.55);
                green = toFloat(values[1]);
                values[1].slice(-1) == "%" && (green *= 2.55);
                blue = toFloat(values[2]);
                values[2].slice(-1) == "%" && (blue *= 2.55);
                (values[0].slice(-3) == "deg" || values[0].slice(-1) == "\xb0") && (red /= 360);
                rgb[1].toLowerCase().slice(0, 4) == "hsla" && (opacity = toFloat(values[3]));
                values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
                return R.hsl2rgb(red, green, blue, opacity);
            }
            rgb = {r: red, g: green, b: blue};
            rgb.hex = "#" + (16777216 | blue | (green << 8) | (red << 16)).toString(16).slice(1);
            R.is(opacity, "finite") && (rgb.opacity = opacity);
            return rgb;
        }
        return {r: -1, g: -1, b: -1, hex: "none", error: 1};
    }, R);
    R.getColor = function (value) {
        var start = this.getColor.start = this.getColor.start || {h: 0, s: 1, b: value || .75},
                rgb = this.hsb2rgb(start.h, start.s, start.b);
        start.h += .075;
        if (start.h > 1) {
            start.h = 0;
            start.s -= .2;
            start.s <= 0 && (this.getColor.start = {h: 0, s: 1, b: start.b});
        }
        return rgb.hex;
    };
    R.getColor.reset = function () {
        delete this.start;
    };
    // path utilities
    R.parsePathString = cacher(function (pathString) {
        if (!pathString) {
            return null;
        }
        var paramCounts = {a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0},
                data = [];
        if (R.is(pathString, array) && R.is(pathString[0], array)) { // rough assumption
            data = pathClone(pathString);
        }
        if (!data[length]) {
            Str(pathString)[rp](pathCommand, function (a, b, c) {
                var params = [],
                        name = lowerCase.call(b);
                c[rp](pathValues, function (a, b) {
                    b && params[push](+b);
                });
                if (name == "m" && params[length] > 2) {
                    data[push]([b][concat](params.splice(0, 2)));
                    name = "l";
                    b = b == "m" ? "l" : "L";
                }
                while (params[length] >= paramCounts[name]) {
                    data[push]([b][concat](params.splice(0, paramCounts[name])));
                    if (!paramCounts[name]) {
                        break;
                    }
                }
            });
        }
        data[toString] = R._path2string;
        return data;
    });
    R.findDotsAtSegment = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
        var t1 = 1 - t,
                x = pow(t1, 3) * p1x + pow(t1, 2) * 3 * t * c1x + t1 * 3 * t * t * c2x + pow(t, 3) * p2x,
                y = pow(t1, 3) * p1y + pow(t1, 2) * 3 * t * c1y + t1 * 3 * t * t * c2y + pow(t, 3) * p2y,
                mx = p1x + 2 * t * (c1x - p1x) + t * t * (c2x - 2 * c1x + p1x),
                my = p1y + 2 * t * (c1y - p1y) + t * t * (c2y - 2 * c1y + p1y),
                nx = c1x + 2 * t * (c2x - c1x) + t * t * (p2x - 2 * c2x + c1x),
                ny = c1y + 2 * t * (c2y - c1y) + t * t * (p2y - 2 * c2y + c1y),
                ax = (1 - t) * p1x + t * c1x,
                ay = (1 - t) * p1y + t * c1y,
                cx = (1 - t) * c2x + t * p2x,
                cy = (1 - t) * c2y + t * p2y,
                alpha = (90 - math.atan((mx - nx) / (my - ny)) * 180 / PI);
        (mx > nx || my < ny) && (alpha += 180);
        return {x: x, y: y, m: {x: mx, y: my}, n: {x: nx, y: ny}, start: {x: ax, y: ay}, end: {x: cx, y: cy}, alpha: alpha};
    };
    var pathDimensions = cacher(function (path) {
        if (!path) {
            return {x: 0, y: 0, width: 0, height: 0};
        }
        path = path2curve(path);
        var x = 0,
                y = 0,
                X = [],
                Y = [],
                p;
        for (var i = 0, ii = path[length]; i < ii; i++) {
            p = path[i];
            if (p[0] == "M") {
                x = p[1];
                y = p[2];
                X[push](x);
                Y[push](y);
            } else {
                var dim = curveDim(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
                X = X[concat](dim.min.x, dim.max.x);
                Y = Y[concat](dim.min.y, dim.max.y);
                x = p[5];
                y = p[6];
            }
        }
        var xmin = mmin[apply](0, X),
                ymin = mmin[apply](0, Y);
        return {
            x: xmin,
            y: ymin,
            width: mmax[apply](0, X) - xmin,
            height: mmax[apply](0, Y) - ymin
        };
    }),
            pathClone = function (pathArray) {
                var res = [];
                if (!R.is(pathArray, array) || !R.is(pathArray && pathArray[0], array)) { // rough assumption
                    pathArray = R.parsePathString(pathArray);
                }
                for (var i = 0, ii = pathArray[length]; i < ii; i++) {
                    res[i] = [];
                    for (var j = 0, jj = pathArray[i][length]; j < jj; j++) {
                        res[i][j] = pathArray[i][j];
                    }
                }
                res[toString] = R._path2string;
                return res;
            },
            pathToRelative = cacher(function (pathArray) {
                if (!R.is(pathArray, array) || !R.is(pathArray && pathArray[0], array)) { // rough assumption
                    pathArray = R.parsePathString(pathArray);
                }
                var res = [],
                        x = 0,
                        y = 0,
                        mx = 0,
                        my = 0,
                        start = 0;
                if (pathArray[0][0] == "M") {
                    x = pathArray[0][1];
                    y = pathArray[0][2];
                    mx = x;
                    my = y;
                    start++;
                    res[push](["M", x, y]);
                }
                for (var i = start, ii = pathArray[length]; i < ii; i++) {
                    var r = res[i] = [],
                            pa = pathArray[i];
                    if (pa[0] != lowerCase.call(pa[0])) {
                        r[0] = lowerCase.call(pa[0]);
                        switch (r[0]) {
                            case "a":
                                r[1] = pa[1];
                                r[2] = pa[2];
                                r[3] = pa[3];
                                r[4] = pa[4];
                                r[5] = pa[5];
                                r[6] = +(pa[6] - x).toFixed(3);
                                r[7] = +(pa[7] - y).toFixed(3);
                                break;
                            case "v":
                                r[1] = +(pa[1] - y).toFixed(3);
                                break;
                            case "m":
                                mx = pa[1];
                                my = pa[2];
                            default:
                                for (var j = 1, jj = pa[length]; j < jj; j++) {
                                    r[j] = +(pa[j] - ((j % 2) ? x : y)).toFixed(3);
                                }
                        }
                    } else {
                        r = res[i] = [];
                        if (pa[0] == "m") {
                            mx = pa[1] + x;
                            my = pa[2] + y;
                        }
                        for (var k = 0, kk = pa[length]; k < kk; k++) {
                            res[i][k] = pa[k];
                        }
                    }
                    var len = res[i][length];
                    switch (res[i][0]) {
                        case "z":
                            x = mx;
                            y = my;
                            break;
                        case "h":
                            x += +res[i][len - 1];
                            break;
                        case "v":
                            y += +res[i][len - 1];
                            break;
                        default:
                            x += +res[i][len - 2];
                            y += +res[i][len - 1];
                    }
                }
                res[toString] = R._path2string;
                return res;
            }, 0, pathClone),
            pathToAbsolute = cacher(function (pathArray) {
                if (!R.is(pathArray, array) || !R.is(pathArray && pathArray[0], array)) { // rough assumption
                    pathArray = R.parsePathString(pathArray);
                }
                var res = [],
                        x = 0,
                        y = 0,
                        mx = 0,
                        my = 0,
                        start = 0;
                if (pathArray[0][0] == "M") {
                    x = +pathArray[0][1];
                    y = +pathArray[0][2];
                    mx = x;
                    my = y;
                    start++;
                    res[0] = ["M", x, y];
                }
                for (var i = start, ii = pathArray[length]; i < ii; i++) {
                    var r = res[i] = [],
                            pa = pathArray[i];
                    if (pa[0] != upperCase.call(pa[0])) {
                        r[0] = upperCase.call(pa[0]);
                        switch (r[0]) {
                            case "A":
                                r[1] = pa[1];
                                r[2] = pa[2];
                                r[3] = pa[3];
                                r[4] = pa[4];
                                r[5] = pa[5];
                                r[6] = +(pa[6] + x);
                                r[7] = +(pa[7] + y);
                                break;
                            case "V":
                                r[1] = +pa[1] + y;
                                break;
                            case "H":
                                r[1] = +pa[1] + x;
                                break;
                            case "M":
                                mx = +pa[1] + x;
                                my = +pa[2] + y;
                            default:
                                for (var j = 1, jj = pa[length]; j < jj; j++) {
                                    r[j] = +pa[j] + ((j % 2) ? x : y);
                                }
                        }
                    } else {
                        for (var k = 0, kk = pa[length]; k < kk; k++) {
                            res[i][k] = pa[k];
                        }
                    }
                    switch (r[0]) {
                        case "Z":
                            x = mx;
                            y = my;
                            break;
                        case "H":
                            x = r[1];
                            break;
                        case "V":
                            y = r[1];
                            break;
                        case "M":
                            mx = res[i][res[i][length] - 2];
                            my = res[i][res[i][length] - 1];
                        default:
                            x = res[i][res[i][length] - 2];
                            y = res[i][res[i][length] - 1];
                    }
                }
                res[toString] = R._path2string;
                return res;
            }, null, pathClone),
            l2c = function (x1, y1, x2, y2) {
                return [x1, y1, x2, y2, x2, y2];
            },
            q2c = function (x1, y1, ax, ay, x2, y2) {
                var _13 = 1 / 3,
                        _23 = 2 / 3;
                return [
                    _13 * x1 + _23 * ax,
                    _13 * y1 + _23 * ay,
                    _13 * x2 + _23 * ax,
                    _13 * y2 + _23 * ay,
                    x2,
                    y2
                ];
            },
            a2c = function (x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {
                // for more information of where this math came from visit:
                // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
                var _120 = PI * 120 / 180,
                        rad = PI / 180 * (+angle || 0),
                        res = [],
                        xy,
                        rotate = cacher(function (x, y, rad) {
                            var X = x * math.cos(rad) - y * math.sin(rad),
                                    Y = x * math.sin(rad) + y * math.cos(rad);
                            return {x: X, y: Y};
                        });
                if (!recursive) {
                    xy = rotate(x1, y1, -rad);
                    x1 = xy.x;
                    y1 = xy.y;
                    xy = rotate(x2, y2, -rad);
                    x2 = xy.x;
                    y2 = xy.y;
                    var cos = math.cos(PI / 180 * angle),
                            sin = math.sin(PI / 180 * angle),
                            x = (x1 - x2) / 2,
                            y = (y1 - y2) / 2;
                    var h = (x * x) / (rx * rx) + (y * y) / (ry * ry);
                    if (h > 1) {
                        h = math.sqrt(h);
                        rx = h * rx;
                        ry = h * ry;
                    }
                    var rx2 = rx * rx,
                            ry2 = ry * ry,
                            k = (large_arc_flag == sweep_flag ? -1 : 1) *
                                    math.sqrt(abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x))),
                            cx = k * rx * y / ry + (x1 + x2) / 2,
                            cy = k * -ry * x / rx + (y1 + y2) / 2,
                            f1 = math.asin(((y1 - cy) / ry).toFixed(9)),
                            f2 = math.asin(((y2 - cy) / ry).toFixed(9));

                    f1 = x1 < cx ? PI - f1 : f1;
                    f2 = x2 < cx ? PI - f2 : f2;
                    f1 < 0 && (f1 = PI * 2 + f1);
                    f2 < 0 && (f2 = PI * 2 + f2);
                    if (sweep_flag && f1 > f2) {
                        f1 = f1 - PI * 2;
                    }
                    if (!sweep_flag && f2 > f1) {
                        f2 = f2 - PI * 2;
                    }
                } else {
                    f1 = recursive[0];
                    f2 = recursive[1];
                    cx = recursive[2];
                    cy = recursive[3];
                }
                var df = f2 - f1;
                if (abs(df) > _120) {
                    var f2old = f2,
                            x2old = x2,
                            y2old = y2;
                    f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1);
                    x2 = cx + rx * math.cos(f2);
                    y2 = cy + ry * math.sin(f2);
                    res = a2c(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy]);
                }
                df = f2 - f1;
                var c1 = math.cos(f1),
                        s1 = math.sin(f1),
                        c2 = math.cos(f2),
                        s2 = math.sin(f2),
                        t = math.tan(df / 4),
                        hx = 4 / 3 * rx * t,
                        hy = 4 / 3 * ry * t,
                        m1 = [x1, y1],
                        m2 = [x1 + hx * s1, y1 - hy * c1],
                        m3 = [x2 + hx * s2, y2 - hy * c2],
                        m4 = [x2, y2];
                m2[0] = 2 * m1[0] - m2[0];
                m2[1] = 2 * m1[1] - m2[1];
                if (recursive) {
                    return [m2, m3, m4][concat](res);
                } else {
                    res = [m2, m3, m4][concat](res)[join]()[split](",");
                    var newres = [];
                    for (var i = 0, ii = res[length]; i < ii; i++) {
                        newres[i] = i % 2 ? rotate(res[i - 1], res[i], rad).y : rotate(res[i], res[i + 1], rad).x;
                    }
                    return newres;
                }
            },
            findDotAtSegment = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
                var t1 = 1 - t;
                return {
                    x: pow(t1, 3) * p1x + pow(t1, 2) * 3 * t * c1x + t1 * 3 * t * t * c2x + pow(t, 3) * p2x,
                    y: pow(t1, 3) * p1y + pow(t1, 2) * 3 * t * c1y + t1 * 3 * t * t * c2y + pow(t, 3) * p2y
                };
            },
            curveDim = cacher(function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) {
                var a = (c2x - 2 * c1x + p1x) - (p2x - 2 * c2x + c1x),
                        b = 2 * (c1x - p1x) - 2 * (c2x - c1x),
                        c = p1x - c1x,
                        t1 = (-b + math.sqrt(b * b - 4 * a * c)) / 2 / a,
                        t2 = (-b - math.sqrt(b * b - 4 * a * c)) / 2 / a,
                        y = [p1y, p2y],
                        x = [p1x, p2x],
                        dot;
                abs(t1) > "1e12" && (t1 = .5);
                abs(t2) > "1e12" && (t2 = .5);
                if (t1 > 0 && t1 < 1) {
                    dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
                    x[push](dot.x);
                    y[push](dot.y);
                }
                if (t2 > 0 && t2 < 1) {
                    dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
                    x[push](dot.x);
                    y[push](dot.y);
                }
                a = (c2y - 2 * c1y + p1y) - (p2y - 2 * c2y + c1y);
                b = 2 * (c1y - p1y) - 2 * (c2y - c1y);
                c = p1y - c1y;
                t1 = (-b + math.sqrt(b * b - 4 * a * c)) / 2 / a;
                t2 = (-b - math.sqrt(b * b - 4 * a * c)) / 2 / a;
                abs(t1) > "1e12" && (t1 = .5);
                abs(t2) > "1e12" && (t2 = .5);
                if (t1 > 0 && t1 < 1) {
                    dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
                    x[push](dot.x);
                    y[push](dot.y);
                }
                if (t2 > 0 && t2 < 1) {
                    dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
                    x[push](dot.x);
                    y[push](dot.y);
                }
                return {
                    min: {x: mmin[apply](0, x), y: mmin[apply](0, y)},
                    max: {x: mmax[apply](0, x), y: mmax[apply](0, y)}
                };
            }),
            path2curve = cacher(function (path, path2) {
                var p = pathToAbsolute(path),
                        p2 = path2 && pathToAbsolute(path2),
                        attrs = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
                        attrs2 = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
                        processPath = function (path, d) {
                            var nx, ny;
                            if (!path) {
                                return ["C", d.x, d.y, d.x, d.y, d.x, d.y];
                            }
                            !(path[0] in {T:1, Q:1}) && (d.qx = d.qy = null);
                            switch (path[0]) {
                                case "M":
                                    d.X = path[1];
                                    d.Y = path[2];
                                    break;
                                case "A":
                                    path = ["C"][concat](a2c[apply](0, [d.x, d.y][concat](path.slice(1))));
                                    break;
                                case "S":
                                    nx = d.x + (d.x - (d.bx || d.x));
                                    ny = d.y + (d.y - (d.by || d.y));
                                    path = ["C", nx, ny][concat](path.slice(1));
                                    break;
                                case "T":
                                    d.qx = d.x + (d.x - (d.qx || d.x));
                                    d.qy = d.y + (d.y - (d.qy || d.y));
                                    path = ["C"][concat](q2c(d.x, d.y, d.qx, d.qy, path[1], path[2]));
                                    break;
                                case "Q":
                                    d.qx = path[1];
                                    d.qy = path[2];
                                    path = ["C"][concat](q2c(d.x, d.y, path[1], path[2], path[3], path[4]));
                                    break;
                                case "L":
                                    path = ["C"][concat](l2c(d.x, d.y, path[1], path[2]));
                                    break;
                                case "H":
                                    path = ["C"][concat](l2c(d.x, d.y, path[1], d.y));
                                    break;
                                case "V":
                                    path = ["C"][concat](l2c(d.x, d.y, d.x, path[1]));
                                    break;
                                case "Z":
                                    path = ["C"][concat](l2c(d.x, d.y, d.X, d.Y));
                                    break;
                            }
                            return path;
                        },
                        fixArc = function (pp, i) {
                            if (pp[i][length] > 7) {
                                pp[i].shift();
                                var pi = pp[i];
                                while (pi[length]) {
                                    pp.splice(i++, 0, ["C"][concat](pi.splice(0, 6)));
                                }
                                pp.splice(i, 1);
                                ii = mmax(p[length], p2 && p2[length] || 0);
                            }
                        },
                        fixM = function (path1, path2, a1, a2, i) {
                            if (path1 && path2 && path1[i][0] == "M" && path2[i][0] != "M") {
                                path2.splice(i, 0, ["M", a2.x, a2.y]);
                                a1.bx = 0;
                                a1.by = 0;
                                a1.x = path1[i][1];
                                a1.y = path1[i][2];
                                ii = mmax(p[length], p2 && p2[length] || 0);
                            }
                        };
                for (var i = 0, ii = mmax(p[length], p2 && p2[length] || 0); i < ii; i++) {
                    p[i] = processPath(p[i], attrs);
                    fixArc(p, i);
                    p2 && (p2[i] = processPath(p2[i], attrs2));
                    p2 && fixArc(p2, i);
                    fixM(p, p2, attrs, attrs2, i);
                    fixM(p2, p, attrs2, attrs, i);
                    var seg = p[i],
                            seg2 = p2 && p2[i],
                            seglen = seg[length],
                            seg2len = p2 && seg2[length];
                    attrs.x = seg[seglen - 2];
                    attrs.y = seg[seglen - 1];
                    attrs.bx = toFloat(seg[seglen - 4]) || attrs.x;
                    attrs.by = toFloat(seg[seglen - 3]) || attrs.y;
                    attrs2.bx = p2 && (toFloat(seg2[seg2len - 4]) || attrs2.x);
                    attrs2.by = p2 && (toFloat(seg2[seg2len - 3]) || attrs2.y);
                    attrs2.x = p2 && seg2[seg2len - 2];
                    attrs2.y = p2 && seg2[seg2len - 1];
                }
                return p2 ? [p, p2] : p;
            }, null, pathClone),
            parseDots = cacher(function (gradient) {
                var dots = [];
                for (var i = 0, ii = gradient[length]; i < ii; i++) {
                    var dot = {},
                            par = gradient[i].match(/^([^:]*):?([\d\.]*)/);
                    dot.color = R.getRGB(par[1]);
                    if (dot.color.error) {
                        return null;
                    }
                    dot.color = dot.color.hex;
                    par[2] && (dot.offset = par[2] + "%");
                    dots[push](dot);
                }
                for (i = 1,ii = dots[length] - 1; i < ii; i++) {
                    if (!dots[i].offset) {
                        var start = toFloat(dots[i - 1].offset || 0),
                                end = 0;
                        for (var j = i + 1; j < ii; j++) {
                            if (dots[j].offset) {
                                end = dots[j].offset;
                                break;
                            }
                        }
                        if (!end) {
                            end = 100;
                            j = ii;
                        }
                        end = toFloat(end);
                        var d = (end - start) / (j - i + 1);
                        for (; i < j; i++) {
                            start += d;
                            dots[i].offset = start + "%";
                        }
                    }
                }
                return dots;
            }),
            getContainer = function (x, y, w, h) {
                var container;
                if (R.is(x, string) || R.is(x, "object")) {
                    container = R.is(x, string) ? doc.getElementById(x) : x;
                    if (container.tagName) {
                        if (y == null) {
                            return {
                                container: container,
                                width: container.style.pixelWidth || container.offsetWidth,
                                height: container.style.pixelHeight || container.offsetHeight
                            };
                        } else {
                            return {container: container, width: y, height: w};
                        }
                    }
                } else {
                    return {container: 1, x: x, y: y, width: w, height: h};
                }
            },
            plugins = function (con, add) {
                var that = this;
                for (var prop in add) {
                    if (add[has](prop) && !(prop in con)) {
                        switch (typeof add[prop]) {
                            case "function":
                                (function (f) {
                                    con[prop] = con === that ? f : function () {
                                        return f[apply](that, arguments);
                                    };
                                })(add[prop]);
                                break;
                            case "object":
                                con[prop] = con[prop] || {};
                                plugins.call(this, con[prop], add[prop]);
                                break;
                            default:
                                con[prop] = add[prop];
                                break;
                        }
                    }
                }
            },
            tear = function (el, paper) {
                el == paper.top && (paper.top = el.prev);
                el == paper.bottom && (paper.bottom = el.next);
                el.next && (el.next.prev = el.prev);
                el.prev && (el.prev.next = el.next);
            },
            tofront = function (el, paper) {
                if (paper.top === el) {
                    return;
                }
                tear(el, paper);
                el.next = null;
                el.prev = paper.top;
                paper.top.next = el;
                paper.top = el;
            },
            toback = function (el, paper) {
                if (paper.bottom === el) {
                    return;
                }
                tear(el, paper);
                el.next = paper.bottom;
                el.prev = null;
                paper.bottom.prev = el;
                paper.bottom = el;
            },
            insertafter = function (el, el2, paper) {
                tear(el, paper);
                el2 == paper.top && (paper.top = el);
                el2.next && (el2.next.prev = el);
                el.next = el2.next;
                el.prev = el2;
                el2.next = el;
            },
            insertbefore = function (el, el2, paper) {
                tear(el, paper);
                el2 == paper.bottom && (paper.bottom = el);
                el2.prev && (el2.prev.next = el);
                el.prev = el2.prev;
                el2.prev = el;
                el.next = el2;
            },
            removed = function (methodname) {
                return function () {
                    throw new Error("Rapha\xebl: you are calling to method \u201c" + methodname + "\u201d of removed object");
                };
            };
    R.pathToRelative = pathToRelative;
    // SVG
    if (R.svg) {
        paperproto.svgns = "http://www.w3.org/2000/svg";
        paperproto.xlink = "http://www.w3.org/1999/xlink";
        round = function (num) {
            return +num + (~~num === num) * .5;
        };
        var $ = function (el, attr) {
            if (attr) {
                for (var key in attr) {
                    if (attr[has](key)) {
                        el[setAttribute](key, Str(attr[key]));
                    }
                }
            } else {
                el = doc.createElementNS(paperproto.svgns, el);
                el.style.webkitTapHighlightColor = "rgba(0,0,0,0)";
                return el;
            }
        };
        R[toString] = function () {
            return  "Your browser supports SVG.\nYou are running Rapha\xebl " + this.version;
        };
        var thePath = function (pathString, SVG) {
            var el = $("path");
            SVG.canvas && SVG.canvas[appendChild](el);
            var p = new Element(el, SVG);
            p.type = "path";
            setFillAndStroke(p, {fill: "none", stroke: "#000", path: pathString});
            return p;
        };
        var addGradientFill = function (o, gradient, SVG) {
            var type = "linear",
                    fx = .5, fy = .5,
                    s = o.style;
            gradient = Str(gradient)[rp](radial_gradient, function (all, _fx, _fy) {
                type = "radial";
                if (_fx && _fy) {
                    fx = toFloat(_fx);
                    fy = toFloat(_fy);
                    var dir = ((fy > .5) * 2 - 1);
                    pow(fx - .5, 2) + pow(fy - .5, 2) > .25 &&
                            (fy = math.sqrt(.25 - pow(fx - .5, 2)) * dir + .5) &&
                            fy != .5 &&
                    (fy = fy.toFixed(5) - 1e-5 * dir);
                }
                return E;
            });
            gradient = gradient[split](/\s*\-\s*/);
            if (type == "linear") {
                var angle = gradient.shift();
                angle = -toFloat(angle);
                if (isNaN(angle)) {
                    return null;
                }
                var vector = [0, 0, math.cos(angle * PI / 180), math.sin(angle * PI / 180)],
                        max = 1 / (mmax(abs(vector[2]), abs(vector[3])) || 1);
                vector[2] *= max;
                vector[3] *= max;
                if (vector[2] < 0) {
                    vector[0] = -vector[2];
                    vector[2] = 0;
                }
                if (vector[3] < 0) {
                    vector[1] = -vector[3];
                    vector[3] = 0;
                }
            }
            var dots = parseDots(gradient);
            if (!dots) {
                return null;
            }
            var id = o.getAttribute(fillString);
            id = id.match(/^url\(#(.*)\)$/);
            id && SVG.defs.removeChild(doc.getElementById(id[1]));

            var el = $(type + "Gradient");
            el.id = createUUID();
            $(el, type == "radial" ? {fx: fx, fy: fy} : {x1: vector[0], y1: vector[1], x2: vector[2], y2: vector[3]});
            SVG.defs[appendChild](el);
            for (var i = 0, ii = dots[length]; i < ii; i++) {
                var stop = $("stop");
                $(stop, {
                    offset: dots[i].offset ? dots[i].offset : !i ? "0%" : "100%",
                    "stop-color": dots[i].color || "#fff"
                });
                el[appendChild](stop);
            }
            $(o, {
                fill: "url(#" + el.id + ")",
                opacity: 1,
                "fill-opacity": 1
            });
            s.fill = E;
            s.opacity = 1;
            s.fillOpacity = 1;
            return 1;
        };
        var updatePosition = function (o) {
            var bbox = o.getBBox();
            $(o.pattern, {patternTransform: R.format("translate({0},{1})", bbox.x, bbox.y)});
        };
        var setFillAndStroke = function (o, params) {
            var dasharray = {
                "": [0],
                "none": [0],
                "-": [3, 1],
                ".": [1, 1],
                "-.": [3, 1, 1, 1],
                "-..": [3, 1, 1, 1, 1, 1],
                ". ": [1, 3],
                "- ": [4, 3],
                "--": [8, 3],
                "- .": [4, 3, 1, 3],
                "--.": [8, 3, 1, 3],
                "--..": [8, 3, 1, 3, 1, 3]
            },
                    node = o.node,
                    attrs = o.attrs,
                    rot = o.rotate(),
                    addDashes = function (o, value) {
                        value = dasharray[lowerCase.call(value)];
                        if (value) {
                            var width = o.attrs["stroke-width"] || "1",
                                    butt = {round: width, square: width, butt: 0}[o.attrs["stroke-linecap"] || params["stroke-linecap"]] || 0,
                                    dashes = [];
                            var i = value[length];
                            while (i--) {
                                dashes[i] = value[i] * width + ((i % 2) ? 1 : -1) * butt;
                            }
                            $(node, {"stroke-dasharray": dashes[join](",")});
                        }
                    };
            params[has]("rotation") && (rot = params.rotation);
            var rotxy = Str(rot)[split](separator);
            if (!(rotxy.length - 1)) {
                rotxy = null;
            } else {
                rotxy[1] = +rotxy[1];
                rotxy[2] = +rotxy[2];
            }
            toFloat(rot) && o.rotate(0, true);
            for (var att in params) {
                if (params[has](att)) {
                    if (!availableAttrs[has](att)) {
                        continue;
                    }
                    var value = params[att];
                    attrs[att] = value;
                    switch (att) {
                        case "blur":
                            o.blur(value);
                            break;
                        case "rotation":
                            o.rotate(value, true);
                            break;
                        case "href":
                        case "title":
                        case "target":
                            var pn = node.parentNode;
                            if (lowerCase.call(pn.tagName) != "a") {
                                var hl = $("a");
                                pn.insertBefore(hl, node);
                                hl[appendChild](node);
                                pn = hl;
                            }
                            if (att == "target" && value == "blank") {
                                pn.setAttributeNS(o.paper.xlink, "show", "new");
                            } else {
                                pn.setAttributeNS(o.paper.xlink, att, value);
                            }
                            break;
                        case "cursor":
                            node.style.cursor = value;
                            break;
                        case "clip-rect":
                            var rect = Str(value)[split](separator);
                            if (rect[length] == 4) {
                                o.clip && o.clip.parentNode.parentNode.removeChild(o.clip.parentNode);
                                var el = $("clipPath"),
                                        rc = $("rect");
                                el.id = createUUID();
                                $(rc, {
                                    x: rect[0],
                                    y: rect[1],
                                    width: rect[2],
                                    height: rect[3]
                                });
                                el[appendChild](rc);
                                o.paper.defs[appendChild](el);
                                $(node, {"clip-path": "url(#" + el.id + ")"});
                                o.clip = rc;
                            }
                            if (!value) {
                                var clip = doc.getElementById(node.getAttribute("clip-path")[rp](/(^url\(#|\)$)/g, E));
                                clip && clip.parentNode.removeChild(clip);
                                $(node, {"clip-path": E});
                                delete o.clip;
                            }
                            break;
                        case "path":
                            if (o.type == "path") {
                                $(node, {d: value ? attrs.path = pathToAbsolute(value) : "M0,0"});
                            }
                            break;
                        case "width":
                            node[setAttribute](att, value);
                            if (attrs.fx) {
                                att = "x";
                                value = attrs.x;
                            } else {
                                break;
                            }
                        case "x":
                            if (attrs.fx) {
                                value = -attrs.x - (attrs.width || 0);
                            }
                        case "rx":
                            if (att == "rx" && o.type == "rect") {
                                break;
                            }
                        case "cx":
                            rotxy && (att == "x" || att == "cx") && (rotxy[1] += value - attrs[att]);
                            node[setAttribute](att, value);
                            o.pattern && updatePosition(o);
                            break;
                        case "height":
                            node[setAttribute](att, value);
                            if (attrs.fy) {
                                att = "y";
                                value = attrs.y;
                            } else {
                                break;
                            }
                        case "y":
                            if (attrs.fy) {
                                value = -attrs.y - (attrs.height || 0);
                            }
                        case "ry":
                            if (att == "ry" && o.type == "rect") {
                                break;
                            }
                        case "cy":
                            rotxy && (att == "y" || att == "cy") && (rotxy[2] += value - attrs[att]);
                            node[setAttribute](att, value);
                            o.pattern && updatePosition(o);
                            break;
                        case "r":
                            if (o.type == "rect") {
                                $(node, {rx: value, ry: value});
                            } else {
                                node[setAttribute](att, value);
                            }
                            break;
                        case "src":
                            if (o.type == "image") {
                                node.setAttributeNS(o.paper.xlink, "href", value);
                            }
                            break;
                        case "stroke-width":
                            node.style.strokeWidth = value;
                            // Need following line for Firefox
                            node[setAttribute](att, value);
                            if (attrs["stroke-dasharray"]) {
                                addDashes(o, attrs["stroke-dasharray"]);
                            }
                            break;
                        case "stroke-dasharray":
                            addDashes(o, value);
                            break;
                        case "translation":
                            var xy = Str(value)[split](separator);
                            xy[0] = +xy[0] || 0;
                            xy[1] = +xy[1] || 0;
                            if (rotxy) {
                                rotxy[1] += xy[0];
                                rotxy[2] += xy[1];
                            }
                            translate.call(o, xy[0], xy[1]);
                            break;
                        case "scale":
                            xy = Str(value)[split](separator);
                            o.scale(+xy[0] || 1, +xy[1] || +xy[0] || 1, isNaN(toFloat(xy[2])) ? null : +xy[2], isNaN(toFloat(xy[3])) ? null : +xy[3]);
                            break;
                        case fillString:
                            var isURL = Str(value).match(ISURL);
                            if (isURL) {
                                el = $("pattern");
                                var ig = $("image");
                                el.id = createUUID();
                                $(el, {x: 0, y: 0, patternUnits: "userSpaceOnUse", height: 1, width: 1});
                                $(ig, {x: 0, y: 0});
                                ig.setAttributeNS(o.paper.xlink, "href", isURL[1]);
                                el[appendChild](ig);

                                var img = doc.createElement("img");
                                img.style.cssText = "position:absolute;left:-9999em;top-9999em";
                                img.onload = function () {
                                    $(el, {width: this.offsetWidth, height: this.offsetHeight});
                                    $(ig, {width: this.offsetWidth, height: this.offsetHeight});
                                    doc.body.removeChild(this);
                                    o.paper.safari();
                                };
                                doc.body[appendChild](img);
                                img.src = isURL[1];
                                o.paper.defs[appendChild](el);
                                node.style.fill = "url(#" + el.id + ")";
                                $(node, {fill: "url(#" + el.id + ")"});
                                o.pattern = el;
                                o.pattern && updatePosition(o);
                                break;
                            }
                            var clr = R.getRGB(value);
                            if (!clr.error) {
                                delete params.gradient;
                                delete attrs.gradient;
                                !R.is(attrs.opacity, "undefined") &&
                                        R.is(params.opacity, "undefined") &&
                                $(node, {opacity: attrs.opacity});
                                !R.is(attrs["fill-opacity"], "undefined") &&
                                        R.is(params["fill-opacity"], "undefined") &&
                                $(node, {"fill-opacity": attrs["fill-opacity"]});
                            } else if ((({circle: 1, ellipse: 1})[has](o.type) || Str(value).charAt() != "r") && addGradientFill(node, value, o.paper)) {
                                attrs.gradient = value;
                                attrs.fill = "none";
                                break;
                            }
                            clr[has]("opacity") && $(node, {"fill-opacity": clr.opacity > 1 ? clr.opacity / 100 : clr.opacity});
                        case "stroke":
                            clr = R.getRGB(value);
                            node[setAttribute](att, clr.hex);
                            att == "stroke" && clr[has]("opacity") && $(node, {"stroke-opacity": clr.opacity > 1 ? clr.opacity / 100 : clr.opacity});
                            break;
                        case "gradient":
                            (({circle: 1, ellipse: 1})[has](o.type) || Str(value).charAt() != "r") && addGradientFill(node, value, o.paper);
                            break;
                        case "opacity":
                            if (attrs.gradient && !attrs[has]("stroke-opacity")) {
                                $(node, {"stroke-opacity": value > 1 ? value / 100 : value});
                            }
                        // fall
                        case "fill-opacity":
                            if (attrs.gradient) {
                                var gradient = doc.getElementById(node.getAttribute(fillString)[rp](/^url\(#|\)$/g, E));
                                if (gradient) {
                                    var stops = gradient.getElementsByTagName("stop");
                                    stops[stops[length] - 1][setAttribute]("stop-opacity", value);
                                }
                                break;
                            }
                        default:
                            att == "font-size" && (value = toInt(value, 10) + "px");
                            var cssrule = att.replace(/(\-.)/g, function (w) {
                                return upperCase.call(w.substring(1));
                            });
                            node.style[cssrule] = value;
                            // Need following line for Firefox
                            node[setAttribute](att, value);
                            break;
                    }
                }
            }

            tuneText(o, params);
            if (rotxy) {
                o.rotate(rotxy.join(S));
            } else {
                toFloat(rot) && o.rotate(rot, true);
            }
        };
        var leading = 1.2,
                tuneText = function (el, params) {
                    if (el.type != "text" || !(params[has]("text") || params[has]("font") || params[has]("font-size") || params[has]("x") || params[has]("y"))) {
                        return;
                    }
                    var a = el.attrs,
                            node = el.node,
                            fontSize = node.firstChild ? toInt(doc.defaultView.getComputedStyle(node.firstChild, E).getPropertyValue("font-size"), 10) : 10;

                    if (params[has]("text")) {
                        a.text = params.text;
                        while (node.firstChild) {
                            node.removeChild(node.firstChild);
                        }
                        var texts = Str(params.text)[split]("\n");
                        for (var i = 0, ii = texts[length]; i < ii; i++) if (texts[i]) {
                            var tspan = $("tspan");
                            i && $(tspan, {dy: fontSize * leading, x: a.x});
                            tspan[appendChild](doc.createTextNode(texts[i]));
                            node[appendChild](tspan);
                        }
                    } else {
                        texts = node.getElementsByTagName("tspan");
                        for (i = 0,ii = texts[length]; i < ii; i++) {
                            i && $(texts[i], {dy: fontSize * leading, x: a.x});
                        }
                    }
                    $(node, {y: a.y});
                    var bb = el.getBBox(),
                            dif = a.y - (bb.y + bb.height / 2);
                    dif && R.is(dif, "finite") && $(node, {y: a.y + dif});
                },
                Element = function (node, svg) {
                    var X = 0,
                            Y = 0;
                    this[0] = node;
                    this.id = R._oid++;
                    this.node = node;
                    node.raphael = this;
                    this.paper = svg;
                    this.attrs = this.attrs || {};
                    this.transformations = []; // rotate, translate, scale
                    this._ = {
                        tx: 0,
                        ty: 0,
                        rt: {deg: 0, cx: 0, cy: 0},
                        sx: 1,
                        sy: 1
                    };
                    !svg.bottom && (svg.bottom = this);
                    this.prev = svg.top;
                    svg.top && (svg.top.next = this);
                    svg.top = this;
                    this.next = null;
                };
        var elproto = Element[proto];
        Element[proto].rotate = function (deg, cx, cy) {
            if (this.removed) {
                return this;
            }
            if (deg == null) {
                if (this._.rt.cx) {
                    return [this._.rt.deg, this._.rt.cx, this._.rt.cy][join](S);
                }
                return this._.rt.deg;
            }
            var bbox = this.getBBox();
            deg = Str(deg)[split](separator);
            if (deg[length] - 1) {
                cx = toFloat(deg[1]);
                cy = toFloat(deg[2]);
            }
            deg = toFloat(deg[0]);
            if (cx != null && cx !== false) {
                this._.rt.deg = deg;
            } else {
                this._.rt.deg += deg;
            }
            (cy == null) && (cx = null);
            this._.rt.cx = cx;
            this._.rt.cy = cy;
            cx = cx == null ? bbox.x + bbox.width / 2 : cx;
            cy = cy == null ? bbox.y + bbox.height / 2 : cy;
            if (this._.rt.deg) {
                this.transformations[0] = R.format("rotate({0} {1} {2})", this._.rt.deg, cx, cy);
                this.clip && $(this.clip, {transform: R.format("rotate({0} {1} {2})", -this._.rt.deg, cx, cy)});
            } else {
                this.transformations[0] = E;
                this.clip && $(this.clip, {transform: E});
            }
            $(this.node, {transform: this.transformations[join](S)});
            return this;
        };
        Element[proto].hide = function () {
            !this.removed && (this.node.style.display = "none");
            return this;
        };
        Element[proto].show = function () {
            !this.removed && (this.node.style.display = "");
            return this;
        };
        Element[proto].remove = function () {
            if (this.removed) {
                return;
            }
            tear(this, this.paper);
            this.node.parentNode.removeChild(this.node);
            for (var i in this) {
                delete this[i];
            }
            this.removed = true;
        };
        Element[proto].getBBox = function () {
            if (this.removed) {
                return this;
            }
            if (this.type == "path") {
                return pathDimensions(this.attrs.path);
            }
            if (this.node.style.display == "none") {
                this.show();
                var hide = true;
            }
            var bbox = {};
            try {
                bbox = this.node.getBBox();
            } catch(e) {
                // Firefox 3.0.x plays badly here
            } finally {
                bbox = bbox || {};
            }
            if (this.type == "text") {
                bbox = {x: bbox.x, y: Infinity, width: 0, height: 0};
                for (var i = 0, ii = this.node.getNumberOfChars(); i < ii; i++) {
                    var bb = this.node.getExtentOfChar(i);
                    (bb.y < bbox.y) && (bbox.y = bb.y);
                    (bb.y + bb.height - bbox.y > bbox.height) && (bbox.height = bb.y + bb.height - bbox.y);
                    (bb.x + bb.width - bbox.x > bbox.width) && (bbox.width = bb.x + bb.width - bbox.x);
                }
            }
            hide && this.hide();
            return bbox;
        };
        Element[proto].attr = function (name, value) {
            if (this.removed) {
                return this;
            }
            if (name == null) {
                var res = {};
                for (var i in this.attrs) if (this.attrs[has](i)) {
                    res[i] = this.attrs[i];
                }
                this._.rt.deg && (res.rotation = this.rotate());
                (this._.sx != 1 || this._.sy != 1) && (res.scale = this.scale());
                res.gradient && res.fill == "none" && (res.fill = res.gradient) && delete res.gradient;
                return res;
            }
            if (value == null && R.is(name, string)) {
                if (name == "translation") {
                    return translate.call(this);
                }
                if (name == "rotation") {
                    return this.rotate();
                }
                if (name == "scale") {
                    return this.scale();
                }
                if (name == fillString && this.attrs.fill == "none" && this.attrs.gradient) {
                    return this.attrs.gradient;
                }
                return this.attrs[name];
            }
            if (value == null && R.is(name, array)) {
                var values = {};
                for (var j = 0, jj = name.length; j < jj; j++) {
                    values[name[j]] = this.attr(name[j]);
                }
                return values;
            }
            if (value != null) {
                var params = {};
                params[name] = value;
            } else if (name != null && R.is(name, "object")) {
                params = name;
            }
            for (var key in this.paper.customAttributes) if (this.paper.customAttributes[has](key) && params[has](key) && R.is(this.paper.customAttributes[key], "function")) {
                var par = this.paper.customAttributes[key].apply(this, [][concat](params[key]));
                this.attrs[key] = params[key];
                for (var subkey in par) if (par[has](subkey)) {
                    params[subkey] = par[subkey];
                }
            }
            setFillAndStroke(this, params);
            return this;
        };
        Element[proto].toFront = function () {
            if (this.removed) {
                return this;
            }
            this.node.parentNode[appendChild](this.node);
            var svg = this.paper;
            svg.top != this && tofront(this, svg);
            return this;
        };
        Element[proto].toBack = function () {
            if (this.removed) {
                return this;
            }
            if (this.node.parentNode.firstChild != this.node) {
                this.node.parentNode.insertBefore(this.node, this.node.parentNode.firstChild);
                toback(this, this.paper);
                var svg = this.paper;
            }
            return this;
        };
        Element[proto].insertAfter = function (element) {
            if (this.removed) {
                return this;
            }
            var node = element.node || element[element.length - 1].node;
            if (node.nextSibling) {
                node.parentNode.insertBefore(this.node, node.nextSibling);
            } else {
                node.parentNode[appendChild](this.node);
            }
            insertafter(this, element, this.paper);
            return this;
        };
        Element[proto].insertBefore = function (element) {
            if (this.removed) {
                return this;
            }
            var node = element.node || element[0].node;
            node.parentNode.insertBefore(this.node, node);
            insertbefore(this, element, this.paper);
            return this;
        };
        Element[proto].blur = function (size) {
            // Experimental. No Safari support. Use it on your own risk.
            var t = this;
            if (+size !== 0) {
                var fltr = $("filter"),
                        blur = $("feGaussianBlur");
                t.attrs.blur = size;
                fltr.id = createUUID();
                $(blur, {stdDeviation: +size || 1.5});
                fltr.appendChild(blur);
                t.paper.defs.appendChild(fltr);
                t._blur = fltr;
                $(t.node, {filter: "url(#" + fltr.id + ")"});
            } else {
                if (t._blur) {
                    t._blur.parentNode.removeChild(t._blur);
                    delete t._blur;
                    delete t.attrs.blur;
                }
                t.node.removeAttribute("filter");
            }
        };
        var theCircle = function (svg, x, y, r) {
            var el = $("circle");
            svg.canvas && svg.canvas[appendChild](el);
            var res = new Element(el, svg);
            res.attrs = {cx: x, cy: y, r: r, fill: "none", stroke: "#000"};
            res.type = "circle";
            $(el, res.attrs);
            return res;
        },
                theRect = function (svg, x, y, w, h, r) {
                    var el = $("rect");
                    svg.canvas && svg.canvas[appendChild](el);
                    var res = new Element(el, svg);
                    res.attrs = {x: x, y: y, width: w, height: h, r: r || 0, rx: r || 0, ry: r || 0, fill: "none", stroke: "#000"};
                    res.type = "rect";
                    $(el, res.attrs);
                    return res;
                },
                theEllipse = function (svg, x, y, rx, ry) {
                    var el = $("ellipse");
                    svg.canvas && svg.canvas[appendChild](el);
                    var res = new Element(el, svg);
                    res.attrs = {cx: x, cy: y, rx: rx, ry: ry, fill: "none", stroke: "#000"};
                    res.type = "ellipse";
                    $(el, res.attrs);
                    return res;
                },
                theImage = function (svg, src, x, y, w, h) {
                    var el = $("image");
                    $(el, {x: x, y: y, width: w, height: h, preserveAspectRatio: "none"});
                    el.setAttributeNS(svg.xlink, "href", src);
                    svg.canvas && svg.canvas[appendChild](el);
                    var res = new Element(el, svg);
                    res.attrs = {x: x, y: y, width: w, height: h, src: src};
                    res.type = "image";
                    return res;
                },
                theText = function (svg, x, y, text) {
                    var el = $("text");
                    $(el, {x: x, y: y, "text-anchor": "middle"});
                    svg.canvas && svg.canvas.appendChild(el);
                    var res = new Element(el, svg);
                    res.attrs = {x: x, y: y, "text-anchor": "middle", text: text, font: availableAttrs.font, stroke: "none", fill: "#000"};
                    res.type = "text";
                    setFillAndStroke(res, res.attrs);
                    return res;
                },
                setSize = function (width, height) {
                    this.width = width || this.width;
                    this.height = height || this.height;
                    this.canvas[setAttribute]("width", this.width);
                    this.canvas[setAttribute]("height", this.height);
                    return this;
                },
                create = function () {
                    var con = getContainer[apply](0, arguments),
                            container = con && con.container,
                            x = con.x,
                            y = con.y,
                            width = con.width,
                            height = con.height;
                    if (!container) {
                        throw new Error("SVG container not found.");
                    }
                    var cnvs = $("svg");
                    x = x || 0;
                    y = y || 0;
                    width = width || 512;
                    height = height || 342;
                    $(cnvs, {
                        xmlns: "http://www.w3.org/2000/svg",
                        version: 1.1,
                        width: width,
                        height: height
                    });
                    if (container == 1) {
                        cnvs.style.cssText = "position:absolute;left:" + x + "px;top:" + y + "px";
                        doc.body[appendChild](cnvs);
                    } else {
                        if (container.firstChild) {
                            container.insertBefore(cnvs, container.firstChild);
                        } else {
                            container[appendChild](cnvs);
                        }
                    }
                    container = new Paper;
                    container.width = width;
                    container.height = height;
                    container.canvas = cnvs;
                    plugins.call(container, container, R.fn);
                    container.clear();
                    return container;
                };
        paperproto.clear = function () {
            var c = this.canvas;
            while (c.firstChild) {
                c.removeChild(c.firstChild);
            }
            this.bottom = this.top = null;
            (this.desc = $("desc"))[appendChild](doc.createTextNode("Created with Rapha\xebl"));
            c[appendChild](this.desc);
            c[appendChild](this.defs = $("defs"));
        };
        paperproto.remove = function () {
            this.canvas.parentNode && this.canvas.parentNode.removeChild(this.canvas);
            for (var i in this) {
                this[i] = removed(i);
            }
        };
    }

    // VML
    if (R.vml) {
        var map = {M: "m", L: "l", C: "c", Z: "x", m: "t", l: "r", c: "v", z: "x"},
                bites = /([clmz]),?([^clmz]*)/gi,
                blurregexp = / progid:\S+Blur\([^\)]+\)/g,
                val = /-?[^,\s-]+/g,
                coordsize = 1e3 + S + 1e3,
                zoom = 10,
                pathlike = {path: 1, rect: 1},
                path2vml = function (path) {
                    var total = /[ahqstv]/ig,
                            command = pathToAbsolute;
                    Str(path).match(total) && (command = path2curve);
                    total = /[clmz]/g;
                    if (command == pathToAbsolute && !Str(path).match(total)) {
                        var res = Str(path)[rp](bites, function (all, command, args) {
                            var vals = [],
                                    isMove = lowerCase.call(command) == "m",
                                    res = map[command];
                            args[rp](val, function (value) {
                                if (isMove && vals[length] == 2) {
                                    res += vals + map[command == "m" ? "l" : "L"];
                                    vals = [];
                                }
                                vals[push](round(value * zoom));
                            });
                            return res + vals;
                        });
                        return res;
                    }
                    var pa = command(path), p, r;
                    res = [];
                    for (var i = 0, ii = pa[length]; i < ii; i++) {
                        p = pa[i];
                        r = lowerCase.call(pa[i][0]);
                        r == "z" && (r = "x");
                        for (var j = 1, jj = p[length]; j < jj; j++) {
                            r += round(p[j] * zoom) + (j != jj - 1 ? "," : E);
                        }
                        res[push](r);
                    }
                    return res[join](S);
                };

        R[toString] = function () {
            return  "Your browser doesn\u2019t support SVG. Falling down to VML.\nYou are running Rapha\xebl " + this.version;
        };
        thePath = function (pathString, vml) {
            var g = createNode("group");
            g.style.cssText = "position:absolute;left:0;top:0;width:" + vml.width + "px;height:" + vml.height + "px";
            g.coordsize = vml.coordsize;
            g.coordorigin = vml.coordorigin;
            var el = createNode("shape"), ol = el.style;
            ol.width = vml.width + "px";
            ol.height = vml.height + "px";
            el.coordsize = coordsize;
            el.coordorigin = vml.coordorigin;
            g[appendChild](el);
            var p = new Element(el, g, vml),
                    attr = {fill: "none", stroke: "#000"};
            pathString && (attr.path = pathString);
            p.type = "path";
            p.path = [];
            p.Path = E;
            setFillAndStroke(p, attr);
            vml.canvas[appendChild](g);
            return p;
        };
        setFillAndStroke = function (o, params) {
            o.attrs = o.attrs || {};
            var node = o.node,
                    a = o.attrs,
                    s = node.style,
                    xy,
                    newpath = (params.x != a.x || params.y != a.y || params.width != a.width || params.height != a.height || params.r != a.r) && o.type == "rect",
                    res = o;

            for (var par in params) if (params[has](par)) {
                a[par] = params[par];
            }
            if (newpath) {
                a.path = rectPath(a.x, a.y, a.width, a.height, a.r);
                o.X = a.x;
                o.Y = a.y;
                o.W = a.width;
                o.H = a.height;
            }
            params.href && (node.href = params.href);
            params.title && (node.title = params.title);
            params.target && (node.target = params.target);
            params.cursor && (s.cursor = params.cursor);
            "blur" in params && o.blur(params.blur);
            if (params.path && o.type == "path" || newpath) {
                node.path = path2vml(a.path);
            }
            if (params.rotation != null) {
                o.rotate(params.rotation, true);
            }
            if (params.translation) {
                xy = Str(params.translation)[split](separator);
                translate.call(o, xy[0], xy[1]);
                if (o._.rt.cx != null) {
                    o._.rt.cx += + xy[0];
                    o._.rt.cy += + xy[1];
                    o.setBox(o.attrs, xy[0], xy[1]);
                }
            }
            if (params.scale) {
                xy = Str(params.scale)[split](separator);
                o.scale(+xy[0] || 1, +xy[1] || +xy[0] || 1, +xy[2] || null, +xy[3] || null);
            }
            if ("clip-rect" in params) {
                var rect = Str(params["clip-rect"])[split](separator);
                if (rect[length] == 4) {
                    rect[2] = +rect[2] + (+rect[0]);
                    rect[3] = +rect[3] + (+rect[1]);
                    var div = node.clipRect || doc.createElement("div"),
                            dstyle = div.style,
                            group = node.parentNode;
                    dstyle.clip = R.format("rect({1}px {2}px {3}px {0}px)", rect);
                    if (!node.clipRect) {
                        dstyle.position = "absolute";
                        dstyle.top = 0;
                        dstyle.left = 0;
                        dstyle.width = o.paper.width + "px";
                        dstyle.height = o.paper.height + "px";
                        group.parentNode.insertBefore(div, group);
                        div[appendChild](group);
                        node.clipRect = div;
                    }
                }
                if (!params["clip-rect"]) {
                    node.clipRect && (node.clipRect.style.clip = E);
                }
            }
            if (o.type == "image" && params.src) {
                node.src = params.src;
            }
            if (o.type == "image" && params.opacity) {
                node.filterOpacity = ms + ".Alpha(opacity=" + (params.opacity * 100) + ")";
                s.filter = (node.filterMatrix || E) + (node.filterOpacity || E);
            }
            params.font && (s.font = params.font);
            params["font-family"] && (s.fontFamily = '"' + params["font-family"][split](",")[0][rp](/^['"]+|['"]+$/g, E) + '"');
            params["font-size"] && (s.fontSize = params["font-size"]);
            params["font-weight"] && (s.fontWeight = params["font-weight"]);
            params["font-style"] && (s.fontStyle = params["font-style"]);
            if (params.opacity != null ||
                    params["stroke-width"] != null ||
                    params.fill != null ||
                    params.stroke != null ||
                    params["stroke-width"] != null ||
                    params["stroke-opacity"] != null ||
                    params["fill-opacity"] != null ||
                    params["stroke-dasharray"] != null ||
                    params["stroke-miterlimit"] != null ||
                    params["stroke-linejoin"] != null ||
                    params["stroke-linecap"] != null) {
                node = o.shape || node;
                var fill = (node.getElementsByTagName(fillString) && node.getElementsByTagName(fillString)[0]),
                        newfill = false;
                !fill && (newfill = fill = createNode(fillString));
                if ("fill-opacity" in params || "opacity" in params) {
                    var opacity = ((+a["fill-opacity"] + 1 || 2) - 1) * ((+a.opacity + 1 || 2) - 1) * ((+R.getRGB(params.fill).o + 1 || 2) - 1);
                    opacity = mmin(mmax(opacity, 0), 1);
                    fill.opacity = opacity;
                }
                params.fill && (fill.on = true);
                if (fill.on == null || params.fill == "none") {
                    fill.on = false;
                }
                if (fill.on && params.fill) {
                    var isURL = params.fill.match(ISURL);
                    if (isURL) {
                        fill.src = isURL[1];
                        fill.type = "tile";
                    } else {
                        fill.color = R.getRGB(params.fill).hex;
                        fill.src = E;
                        fill.type = "solid";
                        if (R.getRGB(params.fill).error && (res.type in {circle: 1, ellipse: 1} || Str(params.fill).charAt() != "r") && addGradientFill(res, params.fill)) {
                            a.fill = "none";
                            a.gradient = params.fill;
                        }
                    }
                }
                newfill && node[appendChild](fill);
                var stroke = (node.getElementsByTagName("stroke") && node.getElementsByTagName("stroke")[0]),
                        newstroke = false;
                !stroke && (newstroke = stroke = createNode("stroke"));
                if ((params.stroke && params.stroke != "none") ||
                        params["stroke-width"] ||
                        params["stroke-opacity"] != null ||
                        params["stroke-dasharray"] ||
                        params["stroke-miterlimit"] ||
                        params["stroke-linejoin"] ||
                        params["stroke-linecap"]) {
                    stroke.on = true;
                }
                (params.stroke == "none" || stroke.on == null || params.stroke == 0 || params["stroke-width"] == 0) && (stroke.on = false);
                var strokeColor = R.getRGB(params.stroke);
                stroke.on && params.stroke && (stroke.color = strokeColor.hex);
                opacity = ((+a["stroke-opacity"] + 1 || 2) - 1) * ((+a.opacity + 1 || 2) - 1) * ((+strokeColor.o + 1 || 2) - 1);
                var width = (toFloat(params["stroke-width"]) || 1) * .75;
                opacity = mmin(mmax(opacity, 0), 1);
                params["stroke-width"] == null && (width = a["stroke-width"]);
                params["stroke-width"] && (stroke.weight = width);
                width && width < 1 && (opacity *= width) && (stroke.weight = 1);
                stroke.opacity = opacity;

                params["stroke-linejoin"] && (stroke.joinstyle = params["stroke-linejoin"] || "miter");
                stroke.miterlimit = params["stroke-miterlimit"] || 8;
                params["stroke-linecap"] && (stroke.endcap = params["stroke-linecap"] == "butt" ? "flat" : params["stroke-linecap"] == "square" ? "square" : "round");
                if (params["stroke-dasharray"]) {
                    var dasharray = {
                        "-": "shortdash",
                        ".": "shortdot",
                        "-.": "shortdashdot",
                        "-..": "shortdashdotdot",
                        ". ": "dot",
                        "- ": "dash",
                        "--": "longdash",
                        "- .": "dashdot",
                        "--.": "longdashdot",
                        "--..": "longdashdotdot"
                    };
                    stroke.dashstyle = dasharray[has](params["stroke-dasharray"]) ? dasharray[params["stroke-dasharray"]] : E;
                }
                newstroke && node[appendChild](stroke);
            }
            if (res.type == "text") {
                s = res.paper.span.style;
                a.font && (s.font = a.font);
                a["font-family"] && (s.fontFamily = a["font-family"]);
                a["font-size"] && (s.fontSize = a["font-size"]);
                a["font-weight"] && (s.fontWeight = a["font-weight"]);
                a["font-style"] && (s.fontStyle = a["font-style"]);
                res.node.string && (res.paper.span.innerHTML = Str(res.node.string)[rp](/</g, "&#60;")[rp](/&/g, "&#38;")[rp](/\n/g, "<br>"));
                res.W = a.w = res.paper.span.offsetWidth;
                res.H = a.h = res.paper.span.offsetHeight;
                res.X = a.x;
                res.Y = a.y + round(res.H / 2);

                // text-anchor emulationm
                switch (a["text-anchor"]) {
                    case "start":
                        res.node.style["v-text-align"] = "left";
                        res.bbx = round(res.W / 2);
                        break;
                    case "end":
                        res.node.style["v-text-align"] = "right";
                        res.bbx = -round(res.W / 2);
                        break;
                    default:
                        res.node.style["v-text-align"] = "center";
                        break;
                }
            }
        };
        addGradientFill = function (o, gradient) {
            o.attrs = o.attrs || {};
            var attrs = o.attrs,
                    fill,
                    type = "linear",
                    fxfy = ".5 .5";
            o.attrs.gradient = gradient;
            gradient = Str(gradient)[rp](radial_gradient, function (all, fx, fy) {
                type = "radial";
                if (fx && fy) {
                    fx = toFloat(fx);
                    fy = toFloat(fy);
                    pow(fx - .5, 2) + pow(fy - .5, 2) > .25 && (fy = math.sqrt(.25 - pow(fx - .5, 2)) * ((fy > .5) * 2 - 1) + .5);
                    fxfy = fx + S + fy;
                }
                return E;
            });
            gradient = gradient[split](/\s*\-\s*/);
            if (type == "linear") {
                var angle = gradient.shift();
                angle = -toFloat(angle);
                if (isNaN(angle)) {
                    return null;
                }
            }
            var dots = parseDots(gradient);
            if (!dots) {
                return null;
            }
            o = o.shape || o.node;
            fill = o.getElementsByTagName(fillString)[0] || createNode(fillString);
            !fill.parentNode && o.appendChild(fill);
            if (dots[length]) {
                fill.on = true;
                fill.method = "none";
                fill.color = dots[0].color;
                fill.color2 = dots[dots[length] - 1].color;
                var clrs = [];
                for (var i = 0, ii = dots[length]; i < ii; i++) {
                    dots[i].offset && clrs[push](dots[i].offset + S + dots[i].color);
                }
                fill.colors && (fill.colors.value = clrs[length] ? clrs[join]() : "0% " + fill.color);
                if (type == "radial") {
                    fill.type = "gradientradial";
                    fill.focus = "100%";
                    fill.focussize = fxfy;
                    fill.focusposition = fxfy;
                } else {
                    fill.type = "gradient";
                    fill.angle = (270 - angle) % 360;
                }
            }
            return 1;
        };
        Element = function (node, group, vml) {
            var Rotation = 0,
                    RotX = 0,
                    RotY = 0,
                    Scale = 1;
            this[0] = node;
            this.id = R._oid++;
            this.node = node;
            node.raphael = this;
            this.X = 0;
            this.Y = 0;
            this.attrs = {};
            this.Group = group;
            this.paper = vml;
            this._ = {
                tx: 0,
                ty: 0,
                rt: {deg:0},
                sx: 1,
                sy: 1
            };
            !vml.bottom && (vml.bottom = this);
            this.prev = vml.top;
            vml.top && (vml.top.next = this);
            vml.top = this;
            this.next = null;
        };
        elproto = Element[proto];
        elproto.rotate = function (deg, cx, cy) {
            if (this.removed) {
                return this;
            }
            if (deg == null) {
                if (this._.rt.cx) {
                    return [this._.rt.deg, this._.rt.cx, this._.rt.cy][join](S);
                }
                return this._.rt.deg;
            }
            deg = Str(deg)[split](separator);
            if (deg[length] - 1) {
                cx = toFloat(deg[1]);
                cy = toFloat(deg[2]);
            }
            deg = toFloat(deg[0]);
            if (cx != null) {
                this._.rt.deg = deg;
            } else {
                this._.rt.deg += deg;
            }
            cy == null && (cx = null);
            this._.rt.cx = cx;
            this._.rt.cy = cy;
            this.setBox(this.attrs, cx, cy);
            this.Group.style.rotation = this._.rt.deg;
            // gradient fix for rotation. TODO
            // var fill = (this.shape || this.node).getElementsByTagName(fillString);
            // fill = fill[0] || {};
            // var b = ((360 - this._.rt.deg) - 270) % 360;
            // !R.is(fill.angle, "undefined") && (fill.angle = b);
            return this;
        };
        elproto.setBox = function (params, cx, cy) {
            if (this.removed) {
                return this;
            }
            var gs = this.Group.style,
                    os = (this.shape && this.shape.style) || this.node.style;
            params = params || {};
            for (var i in params) if (params[has](i)) {
                this.attrs[i] = params[i];
            }
            cx = cx || this._.rt.cx;
            cy = cy || this._.rt.cy;
            var attr = this.attrs,
                    x,
                    y,
                    w,
                    h;
            switch (this.type) {
                case "circle":
                    x = attr.cx - attr.r;
                    y = attr.cy - attr.r;
                    w = h = attr.r * 2;
                    break;
                case "ellipse":
                    x = attr.cx - attr.rx;
                    y = attr.cy - attr.ry;
                    w = attr.rx * 2;
                    h = attr.ry * 2;
                    break;
                case "image":
                    x = +attr.x;
                    y = +attr.y;
                    w = attr.width || 0;
                    h = attr.height || 0;
                    break;
                case "text":
                    this.textpath.v = ["m", round(attr.x), ", ", round(attr.y - 2), "l", round(attr.x) + 1, ", ", round(attr.y - 2)][join](E);
                    x = attr.x - round(this.W / 2);
                    y = attr.y - this.H / 2;
                    w = this.W;
                    h = this.H;
                    break;
                case "rect":
                case "path":
                    if (!this.attrs.path) {
                        x = 0;
                        y = 0;
                        w = this.paper.width;
                        h = this.paper.height;
                    } else {
                        var dim = pathDimensions(this.attrs.path);
                        x = dim.x;
                        y = dim.y;
                        w = dim.width;
                        h = dim.height;
                    }
                    break;
                default:
                    x = 0;
                    y = 0;
                    w = this.paper.width;
                    h = this.paper.height;
                    break;
            }
            cx = (cx == null) ? x + w / 2 : cx;
            cy = (cy == null) ? y + h / 2 : cy;
            var left = cx - this.paper.width / 2,
                    top = cy - this.paper.height / 2, t;
            gs.left != (t = left + "px") && (gs.left = t);
            gs.top != (t = top + "px") && (gs.top = t);
            this.X = pathlike[has](this.type) ? -left : x;
            this.Y = pathlike[has](this.type) ? -top : y;
            this.W = w;
            this.H = h;
            if (pathlike[has](this.type)) {
                os.left != (t = -left * zoom + "px") && (os.left = t);
                os.top != (t = -top * zoom + "px") && (os.top = t);
            } else if (this.type == "text") {
                os.left != (t = -left + "px") && (os.left = t);
                os.top != (t = -top + "px") && (os.top = t);
            } else {
                gs.width != (t = this.paper.width + "px") && (gs.width = t);
                gs.height != (t = this.paper.height + "px") && (gs.height = t);
                os.left != (t = x - left + "px") && (os.left = t);
                os.top != (t = y - top + "px") && (os.top = t);
                os.width != (t = w + "px") && (os.width = t);
                os.height != (t = h + "px") && (os.height = t);
            }
        };
        elproto.hide = function () {
            !this.removed && (this.Group.style.display = "none");
            return this;
        };
        elproto.show = function () {
            !this.removed && (this.Group.style.display = "block");
            return this;
        };
        elproto.getBBox = function () {
            if (this.removed) {
                return this;
            }
            if (pathlike[has](this.type)) {
                return pathDimensions(this.attrs.path);
            }
            return {
                x: this.X + (this.bbx || 0),
                y: this.Y,
                width: this.W,
                height: this.H
            };
        };
        elproto.remove = function () {
            if (this.removed) {
                return;
            }
            tear(this, this.paper);
            this.node.parentNode.removeChild(this.node);
            this.Group.parentNode.removeChild(this.Group);
            this.shape && this.shape.parentNode.removeChild(this.shape);
            for (var i in this) {
                delete this[i];
            }
            this.removed = true;
        };
        elproto.attr = function (name, value) {
            if (this.removed) {
                return this;
            }
            if (name == null) {
                var res = {};
                for (var i in this.attrs) if (this.attrs[has](i)) {
                    res[i] = this.attrs[i];
                }
                this._.rt.deg && (res.rotation = this.rotate());
                (this._.sx != 1 || this._.sy != 1) && (res.scale = this.scale());
                res.gradient && res.fill == "none" && (res.fill = res.gradient) && delete res.gradient;
                return res;
            }
            if (value == null && R.is(name, "string")) {
                if (name == "translation") {
                    return translate.call(this);
                }
                if (name == "rotation") {
                    return this.rotate();
                }
                if (name == "scale") {
                    return this.scale();
                }
                if (name == fillString && this.attrs.fill == "none" && this.attrs.gradient) {
                    return this.attrs.gradient;
                }
                return this.attrs[name];
            }
            if (this.attrs && value == null && R.is(name, array)) {
                var ii, values = {};
                for (i = 0,ii = name[length]; i < ii; i++) {
                    values[name[i]] = this.attr(name[i]);
                }
                return values;
            }
            var params;
            if (value != null) {
                params = {};
                params[name] = value;
            }
            value == null && R.is(name, "object") && (params = name);
            if (params) {
                for (var key in this.paper.customAttributes) if (this.paper.customAttributes[has](key) && params[has](key) && R.is(this.paper.customAttributes[key], "function")) {
                    var par = this.paper.customAttributes[key].apply(this, [][concat](params[key]));
                    this.attrs[key] = params[key];
                    for (var subkey in par) if (par[has](subkey)) {
                        params[subkey] = par[subkey];
                    }
                }
                if (params.text && this.type == "text") {
                    this.node.string = params.text;
                }
                setFillAndStroke(this, params);
                if (params.gradient && (({circle: 1, ellipse: 1})[has](this.type) || Str(params.gradient).charAt() != "r")) {
                    addGradientFill(this, params.gradient);
                }
                (!pathlike[has](this.type) || this._.rt.deg) && this.setBox(this.attrs);
            }
            return this;
        };
        elproto.toFront = function () {
            !this.removed && this.Group.parentNode[appendChild](this.Group);
            this.paper.top != this && tofront(this, this.paper);
            return this;
        };
        elproto.toBack = function () {
            if (this.removed) {
                return this;
            }
            if (this.Group.parentNode.firstChild != this.Group) {
                this.Group.parentNode.insertBefore(this.Group, this.Group.parentNode.firstChild);
                toback(this, this.paper);
            }
            return this;
        };
        elproto.insertAfter = function (element) {
            if (this.removed) {
                return this;
            }
            if (element.constructor == Set) {
                element = element[element.length - 1];
            }
            if (element.Group.nextSibling) {
                element.Group.parentNode.insertBefore(this.Group, element.Group.nextSibling);
            } else {
                element.Group.parentNode[appendChild](this.Group);
            }
            insertafter(this, element, this.paper);
            return this;
        };
        elproto.insertBefore = function (element) {
            if (this.removed) {
                return this;
            }
            if (element.constructor == Set) {
                element = element[0];
            }
            element.Group.parentNode.insertBefore(this.Group, element.Group);
            insertbefore(this, element, this.paper);
            return this;
        };
        elproto.blur = function (size) {
            var s = this.node.runtimeStyle,
                    f = s.filter;
            f = f.replace(blurregexp, E);
            if (+size !== 0) {
                this.attrs.blur = size;
                s.filter = f + S + ms + ".Blur(pixelradius=" + (+size || 1.5) + ")";
                s.margin = R.format("-{0}px 0 0 -{0}px", round(+size || 1.5));
            } else {
                s.filter = f;
                s.margin = 0;
                delete this.attrs.blur;
            }
        };

        theCircle = function (vml, x, y, r) {
            var g = createNode("group"),
                    o = createNode("oval"),
                    ol = o.style;
            g.style.cssText = "position:absolute;left:0;top:0;width:" + vml.width + "px;height:" + vml.height + "px";
            g.coordsize = coordsize;
            g.coordorigin = vml.coordorigin;
            g[appendChild](o);
            var res = new Element(o, g, vml);
            res.type = "circle";
            setFillAndStroke(res, {stroke: "#000", fill: "none"});
            res.attrs.cx = x;
            res.attrs.cy = y;
            res.attrs.r = r;
            res.setBox({x: x - r, y: y - r, width: r * 2, height: r * 2});
            vml.canvas[appendChild](g);
            return res;
        };
        function rectPath(x, y, w, h, r) {
            if (r) {
                return R.format("M{0},{1}l{2},0a{3},{3},0,0,1,{3},{3}l0,{5}a{3},{3},0,0,1,{4},{3}l{6},0a{3},{3},0,0,1,{4},{4}l0,{7}a{3},{3},0,0,1,{3},{4}z", x + r, y, w - r * 2, r, -r, h - r * 2, r * 2 - w, r * 2 - h);
            } else {
                return R.format("M{0},{1}l{2},0,0,{3},{4},0z", x, y, w, h, -w);
            }
        }

        theRect = function (vml, x, y, w, h, r) {
            var path = rectPath(x, y, w, h, r),
                    res = vml.path(path),
                    a = res.attrs;
            res.X = a.x = x;
            res.Y = a.y = y;
            res.W = a.width = w;
            res.H = a.height = h;
            a.r = r;
            a.path = path;
            res.type = "rect";
            return res;
        };
        theEllipse = function (vml, x, y, rx, ry) {
            var g = createNode("group"),
                    o = createNode("oval"),
                    ol = o.style;
            g.style.cssText = "position:absolute;left:0;top:0;width:" + vml.width + "px;height:" + vml.height + "px";
            g.coordsize = coordsize;
            g.coordorigin = vml.coordorigin;
            g[appendChild](o);
            var res = new Element(o, g, vml);
            res.type = "ellipse";
            setFillAndStroke(res, {stroke: "#000"});
            res.attrs.cx = x;
            res.attrs.cy = y;
            res.attrs.rx = rx;
            res.attrs.ry = ry;
            res.setBox({x: x - rx, y: y - ry, width: rx * 2, height: ry * 2});
            vml.canvas[appendChild](g);
            return res;
        };
        theImage = function (vml, src, x, y, w, h) {
            var g = createNode("group"),
                    o = createNode("image");
            g.style.cssText = "position:absolute;left:0;top:0;width:" + vml.width + "px;height:" + vml.height + "px";
            g.coordsize = coordsize;
            g.coordorigin = vml.coordorigin;
            o.src = src;
            g[appendChild](o);
            var res = new Element(o, g, vml);
            res.type = "image";
            res.attrs.src = src;
            res.attrs.x = x;
            res.attrs.y = y;
            res.attrs.w = w;
            res.attrs.h = h;
            res.setBox({x: x, y: y, width: w, height: h});
            vml.canvas[appendChild](g);
            return res;
        };
        theText = function (vml, x, y, text) {
            var g = createNode("group"),
                    el = createNode("shape"),
                    ol = el.style,
                    path = createNode("path"),
                    ps = path.style,
                    o = createNode("textpath");
            g.style.cssText = "position:absolute;left:0;top:0;width:" + vml.width + "px;height:" + vml.height + "px";
            g.coordsize = coordsize;
            g.coordorigin = vml.coordorigin;
            path.v = R.format("m{0},{1}l{2},{1}", round(x * 10), round(y * 10), round(x * 10) + 1);
            path.textpathok = true;
            ol.width = vml.width;
            ol.height = vml.height;
            o.string = Str(text);
            o.on = true;
            el[appendChild](o);
            el[appendChild](path);
            g[appendChild](el);
            var res = new Element(o, g, vml);
            res.shape = el;
            res.textpath = path;
            res.type = "text";
            res.attrs.text = text;
            res.attrs.x = x;
            res.attrs.y = y;
            res.attrs.w = 1;
            res.attrs.h = 1;
            setFillAndStroke(res, {font: availableAttrs.font, stroke: "none", fill: "#000"});
            res.setBox();
            vml.canvas[appendChild](g);
            return res;
        };
        setSize = function (width, height) {
            var cs = this.canvas.style;
            width == +width && (width += "px");
            height == +height && (height += "px");
            cs.width = width;
            cs.height = height;
            cs.clip = "rect(0 " + width + " " + height + " 0)";
            return this;
        };
        var createNode;
        doc.createStyleSheet().addRule(".rvml", "behavior:url(#default#VML)");
        try {
            !doc.namespaces.rvml && doc.namespaces.add("rvml", "urn:schemas-microsoft-com:vml");
            createNode = function (tagName) {
                return doc.createElement('<rvml:' + tagName + ' class="rvml">');
            };
        } catch (e) {
            createNode = function (tagName) {
                return doc.createElement('<' + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="rvml">');
            };
        }
        create = function () {
            var con = getContainer[apply](0, arguments),
                    container = con.container,
                    height = con.height,
                    s,
                    width = con.width,
                    x = con.x,
                    y = con.y;
            if (!container) {
                throw new Error("VML container not found.");
            }
            var res = new Paper,
                    c = res.canvas = doc.createElement("div"),
                    cs = c.style;
            x = x || 0;
            y = y || 0;
            width = width || 512;
            height = height || 342;
            width == +width && (width += "px");
            height == +height && (height += "px");
            res.width = 1e3;
            res.height = 1e3;
            res.coordsize = zoom * 1e3 + S + zoom * 1e3;
            res.coordorigin = "0 0";
            res.span = doc.createElement("span");
            res.span.style.cssText = "position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;";
            c[appendChild](res.span);
            cs.cssText = R.format("top:0;left:0;width:{0};height:{1};display:inline-block;position:relative;clip:rect(0 {0} {1} 0);overflow:hidden", width, height);
            if (container == 1) {
                doc.body[appendChild](c);
                cs.left = x + "px";
                cs.top = y + "px";
                cs.position = "absolute";
            } else {
                if (container.firstChild) {
                    container.insertBefore(c, container.firstChild);
                } else {
                    container[appendChild](c);
                }
            }
            plugins.call(res, res, R.fn);
            return res;
        };
        paperproto.clear = function () {
            this.canvas.innerHTML = E;
            this.span = doc.createElement("span");
            this.span.style.cssText = "position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;";
            this.canvas[appendChild](this.span);
            this.bottom = this.top = null;
        };
        paperproto.remove = function () {
            this.canvas.parentNode.removeChild(this.canvas);
            for (var i in this) {
                this[i] = removed(i);
            }
            return true;
        };
    }

    // rest
    // WebKit rendering bug workaround method
    var version = navigator.userAgent.match(/Version\/(.*?)\s/);
    if ((navigator.vendor == "Apple Computer, Inc.") && (version && version[1] < 4 || navigator.platform.slice(0, 2) == "iP")) {
        paperproto.safari = function () {
            var rect = this.rect(-99, -99, this.width + 99, this.height + 99).attr({stroke: "none"});
            win.setTimeout(function () {
                rect.remove();
            });
        };
    } else {
        paperproto.safari = function () {
        };
    }

    // Events
    var preventDefault = function () {
        this.returnValue = false;
    },
            preventTouch = function () {
                return this.originalEvent.preventDefault();
            },
            stopPropagation = function () {
                this.cancelBubble = true;
            },
            stopTouch = function () {
                return this.originalEvent.stopPropagation();
            },
            addEvent = (function () {
                if (doc.addEventListener) {
                    return function (obj, type, fn, element) {
                        var realName = supportsTouch && touchMap[type] ? touchMap[type] : type;
                        var f = function (e) {
                            if (supportsTouch && touchMap[has](type)) {
                                for (var i = 0, ii = e.targetTouches && e.targetTouches.length; i < ii; i++) {
                                    if (e.targetTouches[i].target == obj) {
                                        var olde = e;
                                        e = e.targetTouches[i];
                                        e.originalEvent = olde;
                                        e.preventDefault = preventTouch;
                                        e.stopPropagation = stopTouch;
                                        break;
                                    }
                                }
                            }
                            return fn.call(element, e);
                        };
                        obj.addEventListener(realName, f, false);
                        return function () {
                            obj.removeEventListener(realName, f, false);
                            return true;
                        };
                    };
                } else if (doc.attachEvent) {
                    return function (obj, type, fn, element) {
                        var f = function (e) {
                            e = e || win.event;
                            e.preventDefault = e.preventDefault || preventDefault;
                            e.stopPropagation = e.stopPropagation || stopPropagation;
                            return fn.call(element, e);
                        };
                        obj.attachEvent("on" + type, f);
                        var detacher = function () {
                            obj.detachEvent("on" + type, f);
                            return true;
                        };
                        return detacher;
                    };
                }
            })(),
            drag = [],
            dragMove = function (e) {
                var x = e.clientX,
                        y = e.clientY,
                        scrollY = doc.documentElement.scrollTop || doc.body.scrollTop,
                        scrollX = doc.documentElement.scrollLeft || doc.body.scrollLeft,
                        dragi,
                        j = drag.length;
                while (j--) {
                    dragi = drag[j];
                    if (supportsTouch) {
                        var i = e.touches.length,
                                touch;
                        while (i--) {
                            touch = e.touches[i];
                            if (touch.identifier == dragi.el._drag.id) {
                                x = touch.clientX;
                                y = touch.clientY;
                                (e.originalEvent ? e.originalEvent : e).preventDefault();
                                break;
                            }
                        }
                    } else {
                        e.preventDefault();
                    }
                    x += scrollX;
                    y += scrollY;
                    dragi.move && dragi.move.call(dragi.move_scope || dragi.el, x - dragi.el._drag.x, y - dragi.el._drag.y, x, y, e);
                }
            },
            dragUp = function (e) {
                R.unmousemove(dragMove).unmouseup(dragUp);
                var i = drag.length,
                        dragi;
                while (i--) {
                    dragi = drag[i];
                    dragi.el._drag = {};
                    dragi.end && dragi.end.call(dragi.end_scope || dragi.start_scope || dragi.move_scope || dragi.el, e);
                }
                drag = [];
            };
    for (var i = events[length]; i--;) {
        (function (eventName) {
            R[eventName] = Element[proto][eventName] = function (fn, scope) {
                if (R.is(fn, "function")) {
                    this.events = this.events || [];
                    this.events.push({name: eventName, f: fn, unbind: addEvent(this.shape || this.node || doc, eventName, fn, scope || this)});
                }
                return this;
            };
            R["un" + eventName] = Element[proto]["un" + eventName] = function (fn) {
                var events = this.events,
                        l = events[length];
                while (l--) if (events[l].name == eventName && events[l].f == fn) {
                    events[l].unbind();
                    events.splice(l, 1);
                    !events.length && delete this.events;
                    return this;
                }
                return this;
            };
        })(events[i]);
    }
    elproto.hover = function (f_in, f_out, scope_in, scope_out) {
        return this.mouseover(f_in, scope_in).mouseout(f_out, scope_out || scope_in);
    };
    elproto.unhover = function (f_in, f_out) {
        return this.unmouseover(f_in).unmouseout(f_out);
    };
    elproto.drag = function (onmove, onstart, onend, move_scope, start_scope, end_scope) {
        this._drag = {};
        this.mousedown(function (e) {
            (e.originalEvent || e).preventDefault();
            var scrollY = doc.documentElement.scrollTop || doc.body.scrollTop,
                    scrollX = doc.documentElement.scrollLeft || doc.body.scrollLeft;
            this._drag.x = e.clientX + scrollX;
            this._drag.y = e.clientY + scrollY;
            this._drag.id = e.identifier;
            onstart && onstart.call(start_scope || move_scope || this, e.clientX + scrollX, e.clientY + scrollY, e);
            !drag.length && R.mousemove(dragMove).mouseup(dragUp);
            drag.push({el: this, move: onmove, end: onend, move_scope: move_scope, start_scope: start_scope, end_scope: end_scope});
        });
        return this;
    };
    elproto.undrag = function (onmove, onstart, onend) {
        var i = drag.length;
        while (i--) {
            drag[i].el == this && (drag[i].move == onmove && drag[i].end == onend) && drag.splice(i++, 1);
        }
        !drag.length && R.unmousemove(dragMove).unmouseup(dragUp);
    };
    paperproto.circle = function (x, y, r) {
        return theCircle(this, x || 0, y || 0, r || 0);
    };
    paperproto.rect = function (x, y, w, h, r) {
        return theRect(this, x || 0, y || 0, w || 0, h || 0, r || 0);
    };
    paperproto.ellipse = function (x, y, rx, ry) {
        return theEllipse(this, x || 0, y || 0, rx || 0, ry || 0);
    };
    paperproto.path = function (pathString) {
        pathString && !R.is(pathString, string) && !R.is(pathString[0], array) && (pathString += E);
        return thePath(R.format[apply](R, arguments), this);
    };
    paperproto.image = function (src, x, y, w, h) {
        return theImage(this, src || "about:blank", x || 0, y || 0, w || 0, h || 0);
    };
    paperproto.text = function (x, y, text) {
        return theText(this, x || 0, y || 0, Str(text));
    };
    paperproto.set = function (itemsArray) {
        arguments[length] > 1 && (itemsArray = Array[proto].splice.call(arguments, 0, arguments[length]));
        return new Set(itemsArray);
    };
    paperproto.setSize = setSize;
    paperproto.top = paperproto.bottom = null;
    paperproto.raphael = R;
    function x_y() {
        return this.x + S + this.y;
    }

    elproto.resetScale = function () {
        if (this.removed) {
            return this;
        }
        this._.sx = 1;
        this._.sy = 1;
        this.attrs.scale = "1 1";
    };
    elproto.scale = function (x, y, cx, cy) {
        if (this.removed) {
            return this;
        }
        if (x == null && y == null) {
            return {
                x: this._.sx,
                y: this._.sy,
                toString: x_y
            };
        }
        y = y || x;
        !+y && (y = x);
        var dx,
                dy,
                dcx,
                dcy,
                a = this.attrs;
        if (x != 0) {
            var bb = this.getBBox(),
                    rcx = bb.x + bb.width / 2,
                    rcy = bb.y + bb.height / 2,
                    kx = abs(x / this._.sx),
                    ky = abs(y / this._.sy);
            cx = (+cx || cx == 0) ? cx : rcx;
            cy = (+cy || cy == 0) ? cy : rcy;
            var posx = this._.sx > 0,
                    posy = this._.sy > 0,
                    dirx = ~~(x / abs(x)),
                    diry = ~~(y / abs(y)),
                    dkx = kx * dirx,
                    dky = ky * diry,
                    s = this.node.style,
                    ncx = cx + abs(rcx - cx) * dkx * (rcx > cx == posx ? 1 : -1),
                    ncy = cy + abs(rcy - cy) * dky * (rcy > cy == posy ? 1 : -1),
                    fr = (x * dirx > y * diry ? ky : kx);
            switch (this.type) {
                case "rect":
                case "image":
                    var neww = a.width * kx,
                            newh = a.height * ky;
                    this.attr({
                        height: newh,
                        r: a.r * fr,
                        width: neww,
                        x: ncx - neww / 2,
                        y: ncy - newh / 2
                    });
                    break;
                case "circle":
                case "ellipse":
                    this.attr({
                        rx: a.rx * kx,
                        ry: a.ry * ky,
                        r: a.r * fr,
                        cx: ncx,
                        cy: ncy
                    });
                    break;
                case "text":
                    this.attr({
                        x: ncx,
                        y: ncy
                    });
                    break;
                case "path":
                    var path = pathToRelative(a.path),
                            skip = true,
                            fx = posx ? dkx : kx,
                            fy = posy ? dky : ky;
                    for (var i = 0, ii = path[length]; i < ii; i++) {
                        var p = path[i],
                                P0 = upperCase.call(p[0]);
                        if (P0 == "M" && skip) {
                            continue;
                        } else {
                            skip = false;
                        }
                        if (P0 == "A") {
                            p[path[i][length] - 2] *= fx;
                            p[path[i][length] - 1] *= fy;
                            p[1] *= kx;
                            p[2] *= ky;
                            p[5] = +(dirx + diry ? !!+p[5] : !+p[5]);
                        } else if (P0 == "H") {
                            for (var j = 1, jj = p[length]; j < jj; j++) {
                                p[j] *= fx;
                            }
                        } else if (P0 == "V") {
                            for (j = 1,jj = p[length]; j < jj; j++) {
                                p[j] *= fy;
                            }
                        } else {
                            for (j = 1,jj = p[length]; j < jj; j++) {
                                p[j] *= (j % 2) ? fx : fy;
                            }
                        }
                    }
                    var dim2 = pathDimensions(path);
                    dx = ncx - dim2.x - dim2.width / 2;
                    dy = ncy - dim2.y - dim2.height / 2;
                    path[0][1] += dx;
                    path[0][2] += dy;
                    this.attr({path: path});
                    break;
            }
            if (this.type in {text: 1, image:1} && (dirx != 1 || diry != 1)) {
                if (this.transformations) {
                    this.transformations[2] = "scale("[concat](dirx, ",", diry, ")");
                    this.node[setAttribute]("transform", this.transformations[join](S));
                    dx = (dirx == -1) ? -a.x - (neww || 0) : a.x;
                    dy = (diry == -1) ? -a.y - (newh || 0) : a.y;
                    this.attr({x: dx, y: dy});
                    a.fx = dirx - 1;
                    a.fy = diry - 1;
                } else {
                    this.node.filterMatrix = ms + ".Matrix(M11="[concat](dirx,
                            ", M12=0, M21=0, M22=", diry,
                            ", Dx=0, Dy=0, sizingmethod='auto expand', filtertype='bilinear')");
                    s.filter = (this.node.filterMatrix || E) + (this.node.filterOpacity || E);
                }
            } else {
                if (this.transformations) {
                    this.transformations[2] = E;
                    this.node[setAttribute]("transform", this.transformations[join](S));
                    a.fx = 0;
                    a.fy = 0;
                } else {
                    this.node.filterMatrix = E;
                    s.filter = (this.node.filterMatrix || E) + (this.node.filterOpacity || E);
                }
            }
            a.scale = [x, y, cx, cy][join](S);
            this._.sx = x;
            this._.sy = y;
        }
        return this;
    };
    elproto.clone = function () {
        if (this.removed) {
            return null;
        }
        var attr = this.attr();
        delete attr.scale;
        delete attr.translation;
        return this.paper[this.type]().attr(attr);
    };
    var curveslengths = {},
            getPointAtSegmentLength = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, length) {
                var len = 0,
                        precision = 100,
                        name = [p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y].join(),
                        cache = curveslengths[name],
                        old, dot;
                !cache && (curveslengths[name] = cache = {data: []});
                cache.timer && clearTimeout(cache.timer);
                cache.timer = setTimeout(function () {
                    delete curveslengths[name];
                }, 2000);
                if (length != null) {
                    var total = getPointAtSegmentLength(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y);
                    precision = ~~total * 10;
                }
                for (var i = 0; i < precision + 1; i++) {
                    if (cache.data[length] > i) {
                        dot = cache.data[i * precision];
                    } else {
                        dot = R.findDotsAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, i / precision);
                        cache.data[i] = dot;
                    }
                    i && (len += pow(pow(old.x - dot.x, 2) + pow(old.y - dot.y, 2), .5));
                    if (length != null && len >= length) {
                        return dot;
                    }
                    old = dot;
                }
                if (length == null) {
                    return len;
                }
            },
            getLengthFactory = function (istotal, subpath) {
                return function (path, length, onlystart) {
                    path = path2curve(path);
                    var x, y, p, l, sp = "", subpaths = {}, point,
                            len = 0;
                    for (var i = 0, ii = path.length; i < ii; i++) {
                        p = path[i];
                        if (p[0] == "M") {
                            x = +p[1];
                            y = +p[2];
                        } else {
                            l = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
                            if (len + l > length) {
                                if (subpath && !subpaths.start) {
                                    point = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
                                    sp += ["C", point.start.x, point.start.y, point.m.x, point.m.y, point.x, point.y];
                                    if (onlystart) {
                                        return sp;
                                    }
                                    subpaths.start = sp;
                                    sp = ["M", point.x, point.y + "C", point.n.x, point.n.y, point.end.x, point.end.y, p[5], p[6]][join]();
                                    len += l;
                                    x = +p[5];
                                    y = +p[6];
                                    continue;
                                }
                                if (!istotal && !subpath) {
                                    point = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
                                    return {x: point.x, y: point.y, alpha: point.alpha};
                                }
                            }
                            len += l;
                            x = +p[5];
                            y = +p[6];
                        }
                        sp += p;
                    }
                    subpaths.end = sp;
                    point = istotal ? len : subpath ? subpaths : R.findDotsAtSegment(x, y, p[1], p[2], p[3], p[4], p[5], p[6], 1);
                    point.alpha && (point = {x: point.x, y: point.y, alpha: point.alpha});
                    return point;
                };
            };
    var getTotalLength = getLengthFactory(1),
            getPointAtLength = getLengthFactory(),
            getSubpathsAtLength = getLengthFactory(0, 1);
    elproto.getTotalLength = function () {
        if (this.type != "path") {
            return;
        }
        if (this.node.getTotalLength) {
            return this.node.getTotalLength();
        }
        return getTotalLength(this.attrs.path);
    };
    elproto.getPointAtLength = function (length) {
        if (this.type != "path") {
            return;
        }
        return getPointAtLength(this.attrs.path, length);
    };
    elproto.getSubpath = function (from, to) {
        if (this.type != "path") {
            return;
        }
        if (abs(this.getTotalLength() - to) < "1e-6") {
            return getSubpathsAtLength(this.attrs.path, from).end;
        }
        var a = getSubpathsAtLength(this.attrs.path, to, 1);
        return from ? getSubpathsAtLength(a, from).end : a;
    };

    // animation easing formulas
    R.easing_formulas = {
        linear: function (n) {
            return n;
        },
        "<": function (n) {
            return pow(n, 3);
        },
        ">": function (n) {
            return pow(n - 1, 3) + 1;
        },
        "<>": function (n) {
            n = n * 2;
            if (n < 1) {
                return pow(n, 3) / 2;
            }
            n -= 2;
            return (pow(n, 3) + 2) / 2;
        },
        backIn: function (n) {
            var s = 1.70158;
            return n * n * ((s + 1) * n - s);
        },
        backOut: function (n) {
            n = n - 1;
            var s = 1.70158;
            return n * n * ((s + 1) * n + s) + 1;
        },
        elastic: function (n) {
            if (n == 0 || n == 1) {
                return n;
            }
            var p = .3,
                    s = p / 4;
            return pow(2, -10 * n) * math.sin((n - s) * (2 * PI) / p) + 1;
        },
        bounce: function (n) {
            var s = 7.5625,
                    p = 2.75,
                    l;
            if (n < (1 / p)) {
                l = s * n * n;
            } else {
                if (n < (2 / p)) {
                    n -= (1.5 / p);
                    l = s * n * n + .75;
                } else {
                    if (n < (2.5 / p)) {
                        n -= (2.25 / p);
                        l = s * n * n + .9375;
                    } else {
                        n -= (2.625 / p);
                        l = s * n * n + .984375;
                    }
                }
            }
            return l;
        }
    };

    var animationElements = [],
            animation = function () {
                var Now = +new Date;
                for (var l = 0; l < animationElements[length]; l++) {
                    var e = animationElements[l];
                    if (e.stop || e.el.removed) {
                        continue;
                    }
                    var time = Now - e.start,
                            ms = e.ms,
                            easing = e.easing,
                            from = e.from,
                            diff = e.diff,
                            to = e.to,
                            t = e.t,
                            that = e.el,
                            set = {},
                            now;
                    if (time < ms) {
                        var pos = easing(time / ms);
                        for (var attr in from) if (from[has](attr)) {
                            switch (availableAnimAttrs[attr]) {
                                case "along":
                                    now = pos * ms * diff[attr];
                                    to.back && (now = to.len - now);
                                    var point = getPointAtLength(to[attr], now);
                                    that.translate(diff.sx - diff.x || 0, diff.sy - diff.y || 0);
                                    diff.x = point.x;
                                    diff.y = point.y;
                                    that.translate(point.x - diff.sx, point.y - diff.sy);
                                    to.rot && that.rotate(diff.r + point.alpha, point.x, point.y);
                                    break;
                                case nu:
                                    now = +from[attr] + pos * ms * diff[attr];
                                    break;
                                case "colour":
                                    now = "rgb(" + [
                                        upto255(round(from[attr].r + pos * ms * diff[attr].r)),
                                        upto255(round(from[attr].g + pos * ms * diff[attr].g)),
                                        upto255(round(from[attr].b + pos * ms * diff[attr].b))
                                    ][join](",") + ")";
                                    break;
                                case "path":
                                    now = [];
                                    for (var i = 0, ii = from[attr][length]; i < ii; i++) {
                                        now[i] = [from[attr][i][0]];
                                        for (var j = 1, jj = from[attr][i][length]; j < jj; j++) {
                                            now[i][j] = +from[attr][i][j] + pos * ms * diff[attr][i][j];
                                        }
                                        now[i] = now[i][join](S);
                                    }
                                    now = now[join](S);
                                    break;
                                case "csv":
                                    switch (attr) {
                                        case "translation":
                                            var x = pos * ms * diff[attr][0] - t.x,
                                                    y = pos * ms * diff[attr][1] - t.y;
                                            t.x += x;
                                            t.y += y;
                                            now = x + S + y;
                                            break;
                                        case "rotation":
                                            now = +from[attr][0] + pos * ms * diff[attr][0];
                                            from[attr][1] && (now += "," + from[attr][1] + "," + from[attr][2]);
                                            break;
                                        case "scale":
                                            now = [+from[attr][0] + pos * ms * diff[attr][0], +from[attr][1] + pos * ms * diff[attr][1], (2 in to[attr] ? to[attr][2] : E), (3 in to[attr] ? to[attr][3] : E)][join](S);
                                            break;
                                        case "clip-rect":
                                            now = [];
                                            i = 4;
                                            while (i--) {
                                                now[i] = +from[attr][i] + pos * ms * diff[attr][i];
                                            }
                                            break;
                                    }
                                    break;
                                default:
                                    var from2 = [].concat(from[attr]);
                                    now = [];
                                    i = that.paper.customAttributes[attr].length;
                                    while (i--) {
                                        now[i] = +from2[i] + pos * ms * diff[attr][i];
                                    }
                                    break;
                            }
                            set[attr] = now;
                        }
                        that.attr(set);
                        that._run && that._run.call(that);
                    } else {
                        if (to.along) {
                            point = getPointAtLength(to.along, to.len * !to.back);
                            that.translate(diff.sx - (diff.x || 0) + point.x - diff.sx, diff.sy - (diff.y || 0) + point.y - diff.sy);
                            to.rot && that.rotate(diff.r + point.alpha, point.x, point.y);
                        }
                        (t.x || t.y) && that.translate(-t.x, -t.y);
                        to.scale && (to.scale += E);
                        that.attr(to);
                        animationElements.splice(l--, 1);
                    }
                }
                R.svg && that && that.paper && that.paper.safari();
                animationElements[length] && setTimeout(animation);
            },
            keyframesRun = function (attr, element, time, prev, prevcallback) {
                var dif = time - prev;
                element.timeouts.push(setTimeout(function () {
                    R.is(prevcallback, "function") && prevcallback.call(element);
                    element.animate(attr, dif, attr.easing);
                }, prev));
            },
            upto255 = function (color) {
                return mmax(mmin(color, 255), 0);
            },
            translate = function (x, y) {
                if (x == null) {
                    return {x: this._.tx, y: this._.ty, toString: x_y};
                }
                this._.tx += +x;
                this._.ty += +y;
                switch (this.type) {
                    case "circle":
                    case "ellipse":
                        this.attr({cx: +x + this.attrs.cx, cy: +y + this.attrs.cy});
                        break;
                    case "rect":
                    case "image":
                    case "text":
                        this.attr({x: +x + this.attrs.x, y: +y + this.attrs.y});
                        break;
                    case "path":
                        var path = pathToRelative(this.attrs.path);
                        path[0][1] += +x;
                        path[0][2] += +y;
                        this.attr({path: path});
                        break;
                }
                return this;
            };
    elproto.animateWith = function (element, params, ms, easing, callback) {
        for (var i = 0, ii = animationElements.length; i < ii; i++) {
            if (animationElements[i].el.id == element.id) {
                params.start = animationElements[i].start;
            }
        }
        return this.animate(params, ms, easing, callback);
    };
    elproto.animateAlong = along();
    elproto.animateAlongBack = along(1);
    function along(isBack) {
        return function (path, ms, rotate, callback) {
            var params = {back: isBack};
            R.is(rotate, "function") ? (callback = rotate) : (params.rot = rotate);
            path && path.constructor == Element && (path = path.attrs.path);
            path && (params.along = path);
            return this.animate(params, ms, callback);
        };
    }

    function CubicBezierAtTime(t, p1x, p1y, p2x, p2y, duration) {
        var cx = 3 * p1x,
                bx = 3 * (p2x - p1x) - cx,
                ax = 1 - cx - bx,
                cy = 3 * p1y,
                by = 3 * (p2y - p1y) - cy,
                ay = 1 - cy - by;

        function sampleCurveX(t) {
            return ((ax * t + bx) * t + cx) * t;
        }

        function solve(x, epsilon) {
            var t = solveCurveX(x, epsilon);
            return ((ay * t + by) * t + cy) * t;
        }

        function solveCurveX(x, epsilon) {
            var t0, t1, t2, x2, d2, i;
            for (t2 = x,i = 0; i < 8; i++) {
                x2 = sampleCurveX(t2) - x;
                if (abs(x2) < epsilon) {
                    return t2;
                }
                d2 = (3 * ax * t2 + 2 * bx) * t2 + cx;
                if (abs(d2) < 1e-6) {
                    break;
                }
                t2 = t2 - x2 / d2;
            }
            t0 = 0;
            t1 = 1;
            t2 = x;
            if (t2 < t0) {
                return t0;
            }
            if (t2 > t1) {
                return t1;
            }
            while (t0 < t1) {
                x2 = sampleCurveX(t2);
                if (abs(x2 - x) < epsilon) {
                    return t2;
                }
                if (x > x2) {
                    t0 = t2;
                } else {
                    t1 = t2;
                }
                t2 = (t1 - t0) / 2 + t0;
            }
            return t2;
        }

        return solve(t, 1 / (200 * duration));
    }

    elproto.onAnimation = function (f) {
        this._run = f || 0;
        return this;
    };
    elproto.animate = function (params, ms, easing, callback) {
        var element = this;
        element.timeouts = element.timeouts || [];
        if (R.is(easing, "function") || !easing) {
            callback = callback || easing || null;
        }
        if (element.removed) {
            callback && callback.call(element);
            return element;
        }
        var from = {},
                to = {},
                animateable = false,
                diff = {};
        for (var attr in params) if (params[has](attr)) {
            if (availableAnimAttrs[has](attr) || element.paper.customAttributes[has](attr)) {
                animateable = true;
                from[attr] = element.attr(attr);
                (from[attr] == null) && (from[attr] = availableAttrs[attr]);
                to[attr] = params[attr];
                switch (availableAnimAttrs[attr]) {
                    case "along":
                        var len = getTotalLength(params[attr]);
                        var point = getPointAtLength(params[attr], len * !!params.back);
                        var bb = element.getBBox();
                        diff[attr] = len / ms;
                        diff.tx = bb.x;
                        diff.ty = bb.y;
                        diff.sx = point.x;
                        diff.sy = point.y;
                        to.rot = params.rot;
                        to.back = params.back;
                        to.len = len;
                        params.rot && (diff.r = toFloat(element.rotate()) || 0);
                        break;
                    case nu:
                        diff[attr] = (to[attr] - from[attr]) / ms;
                        break;
                    case "colour":
                        from[attr] = R.getRGB(from[attr]);
                        var toColour = R.getRGB(to[attr]);
                        diff[attr] = {
                            r: (toColour.r - from[attr].r) / ms,
                            g: (toColour.g - from[attr].g) / ms,
                            b: (toColour.b - from[attr].b) / ms
                        };
                        break;
                    case "path":
                        var pathes = path2curve(from[attr], to[attr]);
                        from[attr] = pathes[0];
                        var toPath = pathes[1];
                        diff[attr] = [];
                        for (var i = 0, ii = from[attr][length]; i < ii; i++) {
                            diff[attr][i] = [0];
                            for (var j = 1, jj = from[attr][i][length]; j < jj; j++) {
                                diff[attr][i][j] = (toPath[i][j] - from[attr][i][j]) / ms;
                            }
                        }
                        break;
                    case "csv":
                        var values = Str(params[attr])[split](separator),
                                from2 = Str(from[attr])[split](separator);
                        switch (attr) {
                            case "translation":
                                from[attr] = [0, 0];
                                diff[attr] = [values[0] / ms, values[1] / ms];
                                break;
                            case "rotation":
                                from[attr] = (from2[1] == values[1] && from2[2] == values[2]) ? from2 : [0, values[1], values[2]];
                                diff[attr] = [(values[0] - from[attr][0]) / ms, 0, 0];
                                break;
                            case "scale":
                                params[attr] = values;
                                from[attr] = Str(from[attr])[split](separator);
                                diff[attr] = [(values[0] - from[attr][0]) / ms, (values[1] - from[attr][1]) / ms, 0, 0];
                                break;
                            case "clip-rect":
                                from[attr] = Str(from[attr])[split](separator);
                                diff[attr] = [];
                                i = 4;
                                while (i--) {
                                    diff[attr][i] = (values[i] - from[attr][i]) / ms;
                                }
                                break;
                        }
                        to[attr] = values;
                        break;
                    default:
                        values = [].concat(params[attr]);
                        from2 = [].concat(from[attr]);
                        diff[attr] = [];
                        i = element.paper.customAttributes[attr][length];
                        while (i--) {
                            diff[attr][i] = ((values[i] || 0) - (from2[i] || 0)) / ms;
                        }
                        break;
                }
            }
        }
        if (!animateable) {
            var attrs = [],
                    lastcall;
            for (var key in params) if (params[has](key) && animKeyFrames.test(key)) {
                attr = {value: params[key]};
                key == "from" && (key = 0);
                key == "to" && (key = 100);
                attr.key = toInt(key, 10);
                attrs.push(attr);
            }
            attrs.sort(sortByKey);
            if (attrs[0].key) {
                attrs.unshift({key: 0, value: element.attrs});
            }
            for (i = 0,ii = attrs[length]; i < ii; i++) {
                keyframesRun(attrs[i].value, element, ms / 100 * attrs[i].key, ms / 100 * (attrs[i - 1] && attrs[i - 1].key || 0), attrs[i - 1] && attrs[i - 1].value.callback);
            }
            lastcall = attrs[attrs[length] - 1].value.callback;
            if (lastcall) {
                element.timeouts.push(setTimeout(function () {
                    lastcall.call(element);
                }, ms));
            }
        } else {
            var easyeasy = R.easing_formulas[easing];
            if (!easyeasy) {
                easyeasy = Str(easing).match(bezierrg);
                if (easyeasy && easyeasy[length] == 5) {
                    var curve = easyeasy;
                    easyeasy = function (t) {
                        return CubicBezierAtTime(t, +curve[1], +curve[2], +curve[3], +curve[4], ms);
                    };
                } else {
                    easyeasy = function (t) {
                        return t;
                    };
                }
            }
            animationElements.push({
                start: params.start || +new Date,
                ms: ms,
                easing: easyeasy,
                from: from,
                diff: diff,
                to: to,
                el: element,
                t: {x: 0, y: 0}
            });
            R.is(callback, "function") && (element._ac = setTimeout(function () {
                callback.call(element);
            }, ms));
            animationElements[length] == 1 && setTimeout(animation);
        }
        return this;
    };
    elproto.stop = function () {
        for (var i = 0; i < animationElements.length; i++) {
            animationElements[i].el.id == this.id && animationElements.splice(i--, 1);
        }
        for (i = 0,ii = this.timeouts && this.timeouts.length; i < ii; i++) {
            clearTimeout(this.timeouts[i]);
        }
        this.timeouts = [];
        clearTimeout(this._ac);
        delete this._ac;
        return this;
    };
    elproto.translate = function (x, y) {
        return this.attr({translation: x + " " + y});
    };
    elproto[toString] = function () {
        return "Rapha\xebl\u2019s object";
    };
    R.ae = animationElements;

    // Set
    var Set = function (items) {
        this.items = [];
        this[length] = 0;
        this.type = "set";
        if (items) {
            for (var i = 0, ii = items[length]; i < ii; i++) {
                if (items[i] && (items[i].constructor == Element || items[i].constructor == Set)) {
                    this[this.items[length]] = this.items[this.items[length]] = items[i];
                    this[length]++;
                }
            }
        }
    };
    Set[proto][push] = function () {
        var item,
                len;
        for (var i = 0, ii = arguments[length]; i < ii; i++) {
            item = arguments[i];
            if (item && (item.constructor == Element || item.constructor == Set)) {
                len = this.items[length];
                this[len] = this.items[len] = item;
                this[length]++;
            }
        }
        return this;
    };
    Set[proto].pop = function () {
        delete this[this[length]--];
        return this.items.pop();
    };
    for (var method in elproto) if (elproto[has](method)) {
        Set[proto][method] = (function (methodname) {
            return function () {
                for (var i = 0, ii = this.items[length]; i < ii; i++) {
                    this.items[i][methodname][apply](this.items[i], arguments);
                }
                return this;
            };
        })(method);
    }
    Set[proto].attr = function (name, value) {
        if (name && R.is(name, array) && R.is(name[0], "object")) {
            for (var j = 0, jj = name[length]; j < jj; j++) {
                this.items[j].attr(name[j]);
            }
        } else {
            for (var i = 0, ii = this.items[length]; i < ii; i++) {
                this.items[i].attr(name, value);
            }
        }
        return this;
    };
    Set[proto].animate = function (params, ms, easing, callback) {
        (R.is(easing, "function") || !easing) && (callback = easing || null);
        var len = this.items[length],
                i = len,
                item,
                set = this,
                collector;
        callback && (collector = function () {
            !--len && callback.call(set);
        });
        easing = R.is(easing, string) ? easing : collector;
        item = this.items[--i].animate(params, ms, easing, collector);
        while (i--) {
            this.items[i] && !this.items[i].removed && this.items[i].animateWith(item, params, ms, easing, collector);
        }
        return this;
    };
    Set[proto].insertAfter = function (el) {
        var i = this.items[length];
        while (i--) {
            this.items[i].insertAfter(el);
        }
        return this;
    };
    Set[proto].getBBox = function () {
        var x = [],
                y = [],
                w = [],
                h = [];
        for (var i = this.items.length; i--;) if (!this.items[i].removed) {
            var box = this.items[i].getBBox();
            x.push(box.x);
            y.push(box.y);
            w.push(box.x + box.width);
            h.push(box.y + box.height);
        }
        x = mmin[apply](0, x);
        y = mmin[apply](0, y);
        return {
            x: x,
            y: y,
            width: mmax[apply](0, w) - x,
            height: mmax[apply](0, h) - y
        };
    };
    Set[proto].clone = function (s) {
        s = new Set;
        for (var i = 0, ii = this.items[length]; i < ii; i++) {
            s[push](this.items[i].clone());
        }
        return s;
    };

    R.registerFont = function (font) {
        if (!font.face) {
            return font;
        }
        this.fonts = this.fonts || {};
        var fontcopy = {
            w: font.w,
            face: {},
            glyphs: {}
        },
                family = font.face["font-family"];
        for (var prop in font.face) if (font.face[has](prop)) {
            fontcopy.face[prop] = font.face[prop];
        }
        if (this.fonts[family]) {
            this.fonts[family][push](fontcopy);
        } else {
            this.fonts[family] = [fontcopy];
        }
        if (!font.svg) {
            fontcopy.face["units-per-em"] = toInt(font.face["units-per-em"], 10);
            for (var glyph in font.glyphs) if (font.glyphs[has](glyph)) {
                var path = font.glyphs[glyph];
                fontcopy.glyphs[glyph] = {
                    w: path.w,
                    k: {},
                    d: path.d && "M" + path.d[rp](/[mlcxtrv]/g, function (command) {
                        return {l: "L", c: "C", x: "z", t: "m", r: "l", v: "c"}[command] || "M";
                    }) + "z"
                };
                if (path.k) {
                    for (var k in path.k) if (path[has](k)) {
                        fontcopy.glyphs[glyph].k[k] = path.k[k];
                    }
                }
            }
        }
        return font;
    };
    paperproto.getFont = function (family, weight, style, stretch) {
        stretch = stretch || "normal";
        style = style || "normal";
        weight = +weight || {normal: 400, bold: 700, lighter: 300, bolder: 800}[weight] || 400;
        if (!R.fonts) {
            return;
        }
        var font = R.fonts[family];
        if (!font) {
            var name = new RegExp("(^|\\s)" + family[rp](/[^\w\d\s+!~.:_-]/g, E) + "(\\s|$)", "i");
            for (var fontName in R.fonts) if (R.fonts[has](fontName)) {
                if (name.test(fontName)) {
                    font = R.fonts[fontName];
                    break;
                }
            }
        }
        var thefont;
        if (font) {
            for (var i = 0, ii = font[length]; i < ii; i++) {
                thefont = font[i];
                if (thefont.face["font-weight"] == weight && (thefont.face["font-style"] == style || !thefont.face["font-style"]) && thefont.face["font-stretch"] == stretch) {
                    break;
                }
            }
        }
        return thefont;
    };
    paperproto.print = function (x, y, string, font, size, origin, letter_spacing) {
        origin = origin || "middle"; // baseline|middle
        letter_spacing = mmax(mmin(letter_spacing || 0, 1), -1);
        var out = this.set(),
                letters = Str(string)[split](E),
                shift = 0,
                path = E,
                scale;
        R.is(font, string) && (font = this.getFont(font));
        if (font) {
            scale = (size || 16) / font.face["units-per-em"];
            var bb = font.face.bbox.split(separator),
                    top = +bb[0],
                    height = +bb[1] + (origin == "baseline" ? bb[3] - bb[1] + (+font.face.descent) : (bb[3] - bb[1]) / 2);
            for (var i = 0, ii = letters[length]; i < ii; i++) {
                var prev = i && font.glyphs[letters[i - 1]] || {},
                        curr = font.glyphs[letters[i]];
                shift += i ? (prev.w || font.w) + (prev.k && prev.k[letters[i]] || 0) + (font.w * letter_spacing) : 0;
                curr && curr.d && out[push](this.path(curr.d).attr({fill: "#000", stroke: "none", translation: [shift, 0]}));
            }
            out.scale(scale, scale, top, height).translate(x - top, y - height);
        }
        return out;
    };

    R.format = function (token, params) {
        var args = R.is(params, array) ? [0][concat](params) : arguments;
        token && R.is(token, string) && args[length] - 1 && (token = token[rp](formatrg, function (str, i) {
            return args[++i] == null ? E : args[i];
        }));
        return token || E;
    };
    R.ninja = function () {
        oldRaphael.was ? (win.Raphael = oldRaphael.is) : delete Raphael;
        return R;
    };
    R.el = elproto;
    R.st = Set[proto];

    oldRaphael.was ? (win.Raphael = R) : (Raphael = R);
})();
/**
 * Popup-Helper inside Raphael-Namespace
 *
 * You have to make sure, that the following scripts are already loaded:
 * <code>raphael.js - Version 1.5.2</code>
 * You might use a higher Version of these files, but without any warranty!
 */
(function () {
var tokenRegex = /\{([^\}]+)\}/g,
    objNotationRegex = /(?:(?:^|\.)(.+?)(?=\[|\.|$|\()|\[('|")(.+?)\2\])(\(\))?/g, // matches .xxxxx or ["xxxxx"] to run over object properties
    replacer = function (all, key, obj) {
        var res = obj;
        key.replace(objNotationRegex, function (all, name, quote, quotedName, isFunc) {
            name = name || quotedName;
            if (res) {
                if (name in res) {
                    res = res[name];
                }
                typeof res == "function" && isFunc && (res = res());
            }
        });
        res = (res == null || res == obj ? all : res) + "";
        return res;
    },
    fill = function (str, obj) {
        return String(str).replace(tokenRegex, function (all, key) {
            return replacer(all, key, obj);
        });
    };
    Raphael.fn.popup = function (X, Y, set, pos, ret) {
        pos = String(pos || "top-middle").split("-");
        pos[1] = pos[1] || "middle";
        var r = 5,
            bb = set.getBBox(),
            w = Math.round(bb.width),
            h = Math.round(bb.height),
            x = Math.round(bb.x) - r,
            y = Math.round(bb.y) - r,
            gap = Math.min(h / 2, w / 2, 10),
            shapes = {
                top: "M{x},{y}h{w4},{w4},{w4},{w4}a{r},{r},0,0,1,{r},{r}v{h4},{h4},{h4},{h4}a{r},{r},0,0,1,-{r},{r}l-{right},0-{gap},{gap}-{gap}-{gap}-{left},0a{r},{r},0,0,1-{r}-{r}v-{h4}-{h4}-{h4}-{h4}a{r},{r},0,0,1,{r}-{r}z",
                bottom: "M{x},{y}l{left},0,{gap}-{gap},{gap},{gap},{right},0a{r},{r},0,0,1,{r},{r}v{h4},{h4},{h4},{h4}a{r},{r},0,0,1,-{r},{r}h-{w4}-{w4}-{w4}-{w4}a{r},{r},0,0,1-{r}-{r}v-{h4}-{h4}-{h4}-{h4}a{r},{r},0,0,1,{r}-{r}z",
                right: "M{x},{y}h{w4},{w4},{w4},{w4}a{r},{r},0,0,1,{r},{r}v{h4},{h4},{h4},{h4}a{r},{r},0,0,1,-{r},{r}h-{w4}-{w4}-{w4}-{w4}a{r},{r},0,0,1-{r}-{r}l0-{bottom}-{gap}-{gap},{gap}-{gap},0-{top}a{r},{r},0,0,1,{r}-{r}z",
                left: "M{x},{y}h{w4},{w4},{w4},{w4}a{r},{r},0,0,1,{r},{r}l0,{top},{gap},{gap}-{gap},{gap},0,{bottom}a{r},{r},0,0,1,-{r},{r}h-{w4}-{w4}-{w4}-{w4}a{r},{r},0,0,1-{r}-{r}v-{h4}-{h4}-{h4}-{h4}a{r},{r},0,0,1,{r}-{r}z"
            },
            offset = {
                hx0: X - (x + r + w - gap * 2),
                hx1: X - (x + r + w / 2 - gap),
                hx2: X - (x + r + gap),
                vhy: Y - (y + r + h + r + gap),
                "^hy": Y - (y - gap)
                
            },
            mask = [{
                x: x + r,
                y: y,
                w: w,
                w4: w / 4,
                h4: h / 4,
                right: 0,
                left: w - gap * 2,
                bottom: 0,
                top: h - gap * 2,
                r: r,
                h: h,
                gap: gap
            }, {
                x: x + r,
                y: y,
                w: w,
                w4: w / 4,
                h4: h / 4,
                left: w / 2 - gap,
                right: w / 2 - gap,
                top: h / 2 - gap,
                bottom: h / 2 - gap,
                r: r,
                h: h,
                gap: gap
            }, {
                x: x + r,
                y: y,
                w: w,
                w4: w / 4,
                h4: h / 4,
                left: 0,
                right: w - gap * 2,
                top: 0,
                bottom: h - gap * 2,
                r: r,
                h: h,
                gap: gap
            }][pos[1] == "middle" ? 1 : (pos[1] == "top" || pos[1] == "left") * 2];
            var dx = 0,
                dy = 0,
                out = this.path(fill(shapes[pos[0]], mask)).insertBefore(set);
            switch (pos[0]) {
                case "top":
                    dx = X - (x + r + mask.left + gap);
                    dy = Y - (y + r + h + r + gap);
                break;
                case "bottom":
                    dx = X - (x + r + mask.left + gap);
                    dy = Y - (y - gap);
                break;
                case "left":
                    dx = X - (x + r + w + r + gap);
                    dy = Y - (y + r + mask.top + gap);
                break;
                case "right":
                    dx = X - (x - gap);
                    dy = Y - (y + r + mask.top + gap);
                break;
            }
            out.translate(dx, dy);
            if (ret) {
                ret = out.attr("path");
                out.remove();
                return {
                    path: ret,
                    dx: dx,
                    dy: dy
                };
            }
            set.translate(dx, dy);
            return out;
    };
})();
/*!
 * g.Raphael 0.4.1 - Charting library, based on Raphaël
 *
 * Copyright (c) 2009 Dmitry Baranovskiy (http://g.raphaeljs.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */


(function () {
    var mmax = Math.max,
        mmin = Math.min;
    Raphael.fn.g = Raphael.fn.g || {};
    Raphael.fn.g.markers = {
        disc: "disc",
        o: "disc",
        flower: "flower",
        f: "flower",
        diamond: "diamond",
        d: "diamond",
        square: "square",
        s: "square",
        triangle: "triangle",
        t: "triangle",
        star: "star",
        "*": "star",
        cross: "cross",
        x: "cross",
        plus: "plus",
        "+": "plus",
        arrow: "arrow",
        "->": "arrow"
    };
    Raphael.fn.g.shim = {stroke: "none", fill: "#000", "fill-opacity": 0};
    Raphael.fn.g.txtattr = {font: "12px Arial, sans-serif"};
    Raphael.fn.g.colors = [];
    var hues = [.6, .2, .05, .1333, .75, 0];
    for (var i = 0; i < 10; i++) {
        if (i < hues.length) {
            Raphael.fn.g.colors.push("hsb(" + hues[i] + ", .75, .75)");
        } else {
            Raphael.fn.g.colors.push("hsb(" + hues[i - hues.length] + ", 1, .5)");
        }
    }
    Raphael.fn.g.text = function (x, y, text) {
        return this.text(x, y, text).attr(this.g.txtattr);
    };
    Raphael.fn.g.labelise = function (label, val, total) {
        if (label) {
            return (label + "").replace(/(##+(?:\.#+)?)|(%%+(?:\.%+)?)/g, function (all, value, percent) {
                if (value) {
                    return (+val).toFixed(value.replace(/^#+\.?/g, "").length);
                }
                if (percent) {
                    return (val * 100 / total).toFixed(percent.replace(/^%+\.?/g, "").length) + "%";
                }
            });
        } else {
            return (+val).toFixed(0);
        }
    };

    Raphael.fn.g.finger = function (x, y, width, height, dir, ending, isPath) {
        // dir 0 for horisontal and 1 for vertical
        if ((dir && !height) || (!dir && !width)) {
            return isPath ? "" : this.path();
        }
        ending = {square: "square", sharp: "sharp", soft: "soft"}[ending] || "round";
        var path;
        height = Math.round(height);
        width = Math.round(width);
        x = Math.round(x);
        y = Math.round(y);
        switch (ending) {
            case "round":
            if (!dir) {
                var r = ~~(height / 2);
                if (width < r) {
                    r = width;
                    path = ["M", x + .5, y + .5 - ~~(height / 2), "l", 0, 0, "a", r, ~~(height / 2), 0, 0, 1, 0, height, "l", 0, 0, "z"];
                } else {
                    path = ["M", x + .5, y + .5 - r, "l", width - r, 0, "a", r, r, 0, 1, 1, 0, height, "l", r - width, 0, "z"];
                }
            } else {
                r = ~~(width / 2);
                if (height < r) {
                    r = height;
                    path = ["M", x - ~~(width / 2), y, "l", 0, 0, "a", ~~(width / 2), r, 0, 0, 1, width, 0, "l", 0, 0, "z"];
                } else {
                    path = ["M", x - r, y, "l", 0, r - height, "a", r, r, 0, 1, 1, width, 0, "l", 0, height - r, "z"];
                }
            }
            break;
            case "sharp":
            if (!dir) {
                var half = ~~(height / 2);
                path = ["M", x, y + half, "l", 0, -height, mmax(width - half, 0), 0, mmin(half, width), half, -mmin(half, width), half + (half * 2 < height), "z"];
            } else {
                half = ~~(width / 2);
                path = ["M", x + half, y, "l", -width, 0, 0, -mmax(height - half, 0), half, -mmin(half, height), half, mmin(half, height), half, "z"];
            }
            break;
            case "square":
            if (!dir) {
                path = ["M", x, y + ~~(height / 2), "l", 0, -height, width, 0, 0, height, "z"];
            } else {
                path = ["M", x + ~~(width / 2), y, "l", 1 - width, 0, 0, -height, width - 1, 0, "z"];
            }
            break;
            case "soft":
            if (!dir) {
                r = mmin(width, Math.round(height / 5));
                path = ["M", x + .5, y + .5 - ~~(height / 2), "l", width - r, 0, "a", r, r, 0, 0, 1, r, r, "l", 0, height - r * 2, "a", r, r, 0, 0, 1, -r, r, "l", r - width, 0, "z"];
            } else {
                r = mmin(Math.round(width / 5), height);
                path = ["M", x - ~~(width / 2), y, "l", 0, r - height, "a", r, r, 0, 0, 1, r, -r, "l", width - 2 * r, 0, "a", r, r, 0, 0, 1, r, r, "l", 0, height - r, "z"];
            }
        }
        if (isPath) {
            return path.join(",");
        } else {
            return this.path(path);
        }
    };

    // Symbols
    Raphael.fn.g.disc = function (cx, cy, r) {
        return this.circle(cx, cy, r);
    };
    Raphael.fn.g.line = function (cx, cy, r) {
        return this.rect(cx - r, cy - r / 5, 2 * r, 2 * r / 5);
    };
    Raphael.fn.g.square = function (cx, cy, r) {
        r = r * .7;
        return this.rect(cx - r, cy - r, 2 * r, 2 * r);
    };
    Raphael.fn.g.triangle = function (cx, cy, r) {
        r *= 1.75;
        return this.path("M".concat(cx, ",", cy, "m0-", r * .58, "l", r * .5, ",", r * .87, "-", r, ",0z"));
    };
    Raphael.fn.g.diamond = function (cx, cy, r) {
        return this.path(["M", cx, cy - r, "l", r, r, -r, r, -r, -r, r, -r, "z"]);
    };
    Raphael.fn.g.flower = function (cx, cy, r, n) {
        r = r * 1.25;
        var rout = r,
            rin = rout * .5;
        n = +n < 3 || !n ? 5 : n;
        var points = ["M", cx, cy + rin, "Q"],
            R;
        for (var i = 1; i < n * 2 + 1; i++) {
            R = i % 2 ? rout : rin;
            points = points.concat([+(cx + R * Math.sin(i * Math.PI / n)).toFixed(3), +(cy + R * Math.cos(i * Math.PI / n)).toFixed(3)]);
        }
        points.push("z");
        return this.path(points.join(","));
    };
    Raphael.fn.g.star = function (cx, cy, r, r2, rays) {
        r2 = r2 || r * .382;
        rays = rays || 5;
        var points = ["M", cx, cy + r2, "L"],
            R;
        for (var i = 1; i < rays * 2; i++) {
            R = i % 2 ? r : r2;
            points = points.concat([(cx + R * Math.sin(i * Math.PI / rays)), (cy + R * Math.cos(i * Math.PI / rays))]);
        }
        points.push("z");
        return this.path(points.join(","));
    };
    Raphael.fn.g.cross = function (cx, cy, r) {
        r = r / 2.5;
        return this.path("M".concat(cx - r, ",", cy, "l", [-r, -r, r, -r, r, r, r, -r, r, r, -r, r, r, r, -r, r, -r, -r, -r, r, -r, -r, "z"]));
    };
    Raphael.fn.g.plus = function (cx, cy, r) {
        r = r / 2;
        return this.path("M".concat(cx - r / 2, ",", cy - r / 2, "l", [0, -r, r, 0, 0, r, r, 0, 0, r, -r, 0, 0, r, -r, 0, 0, -r, -r, 0, 0, -r, "z"]));
    };
    Raphael.fn.g.arrow = function (cx, cy, r) {
        return this.path("M".concat(cx - r * .7, ",", cy - r * .4, "l", [r * .6, 0, 0, -r * .4, r, r * .8, -r, r * .8, 0, -r * .4, -r * .6, 0], "z"));
    };

    // Tooltips
    Raphael.fn.g.tag = function (x, y, text, angle, r) {
        angle = angle || 0;
        r = r == null ? 5 : r;
        text = text == null ? "$9.99" : text;
        var R = .5522 * r,
            res = this.set(),
            d = 3;
        res.push(this.path().attr({fill: "#000", stroke: "#000"}));
        res.push(this.text(x, y, text).attr(this.g.txtattr).attr({fill: "#fff", "font-family": "Helvetica, Arial"}));
        res.update = function () {
            this.rotate(0, x, y);
            var bb = this[1].getBBox();
            if (bb.height >= r * 2) {
                this[0].attr({path: ["M", x, y + r, "a", r, r, 0, 1, 1, 0, -r * 2, r, r, 0, 1, 1, 0, r * 2, "m", 0, -r * 2 -d, "a", r + d, r + d, 0, 1, 0, 0, (r + d) * 2, "L", x + r + d, y + bb.height / 2 + d, "l", bb.width + 2 * d, 0, 0, -bb.height - 2 * d, -bb.width - 2 * d, 0, "L", x, y - r - d].join(",")});
            } else {
                var dx = Math.sqrt(Math.pow(r + d, 2) - Math.pow(bb.height / 2 + d, 2));
                this[0].attr({path: ["M", x, y + r, "c", -R, 0, -r, R - r, -r, -r, 0, -R, r - R, -r, r, -r, R, 0, r, r - R, r, r, 0, R, R - r, r, -r, r, "M", x + dx, y - bb.height / 2 - d, "a", r + d, r + d, 0, 1, 0, 0, bb.height + 2 * d, "l", r + d - dx + bb.width + 2 * d, 0, 0, -bb.height - 2 * d, "L", x + dx, y - bb.height / 2 - d].join(",")});
            }
            this[1].attr({x: x + r + d + bb.width / 2, y: y});
            angle = (360 - angle) % 360;
            this.rotate(angle, x, y);
            angle > 90 && angle < 270 && this[1].attr({x: x - r - d - bb.width / 2, y: y, rotation: [180 + angle, x, y]});
            return this;
        };
        res.update();
        return res;
    };
    Raphael.fn.g.popupit = function (x, y, set, dir, size) {
        dir = dir == null ? 2 : dir;
        size = size || 5;
        x = Math.round(x);
        y = Math.round(y);
        var bb = set.getBBox(),
            w = Math.round(bb.width / 2),
            h = Math.round(bb.height / 2),
            dx = [0, w + size * 2, 0, -w - size * 2],
            dy = [-h * 2 - size * 3, -h - size, 0, -h - size],
            p = ["M", x - dx[dir], y - dy[dir], "l", -size, (dir == 2) * -size, -mmax(w - size, 0), 0, "a", size, size, 0, 0, 1, -size, -size,
                "l", 0, -mmax(h - size, 0), (dir == 3) * -size, -size, (dir == 3) * size, -size, 0, -mmax(h - size, 0), "a", size, size, 0, 0, 1, size, -size,
                "l", mmax(w - size, 0), 0, size, !dir * -size, size, !dir * size, mmax(w - size, 0), 0, "a", size, size, 0, 0, 1, size, size,
                "l", 0, mmax(h - size, 0), (dir == 1) * size, size, (dir == 1) * -size, size, 0, mmax(h - size, 0), "a", size, size, 0, 0, 1, -size, size,
                "l", -mmax(w - size, 0), 0, "z"].join(","),
            xy = [{x: x, y: y + size * 2 + h}, {x: x - size * 2 - w, y: y}, {x: x, y: y - size * 2 - h}, {x: x + size * 2 + w, y: y}][dir];
        set.translate(xy.x - w - bb.x, xy.y - h - bb.y);
        return this.path(p).attr({fill: "#000", stroke: "none"}).insertBefore(set.node ? set : set[0]);
    };
    Raphael.fn.g.popup = function (x, y, text, dir, size) {
        dir = dir == null ? 2 : dir > 3 ? 3 : dir;
        size = size || 5;
        text = text || "$9.99";
        var res = this.set(),
            d = 3;
        res.push(this.path().attr({fill: "#383", stroke: "#000"}));
        res.push(this.text(x, y, text).attr(this.g.txtattr).attr({fill: "#fff", "font-family": "Helvetica, Arial"}));
        res.update = function (X, Y, withAnimation) {
            X = X || x;
            Y = Y || y;
            var bb = this[1].getBBox(),
                w = bb.width / 2,
                h = bb.height / 2,
                dx = [0, w + size * 2, 0, -w - size * 2],
                dy = [-h * 2 - size * 3, -h - size, 0, -h - size],
                p = ["M", X - dx[dir], Y - dy[dir], "l", -size, (dir == 2) * -size, -mmax(w - size, 0), 0, "a", size, size, 0, 0, 1, -size, -size,
                    "l", 0, -mmax(h - size, 0), (dir == 3) * -size, -size, (dir == 3) * size, -size, 0, -mmax(h - size, 0), "a", size, size, 0, 0, 1, size, -size,
                    "l", mmax(w - size, 0), 0, size, !dir * -size, size, !dir * size, mmax(w - size, 0), 0, "a", size, size, 0, 0, 1, size, size,
                    "l", 0, mmax(h - size, 0), (dir == 1) * size, size, (dir == 1) * -size, size, 0, mmax(h - size, 0), "a", size, size, 0, 0, 1, -size, size,
                    "l", -mmax(w - size, 0), 0, "z"].join(","),
                xy = [{x: X, y: Y + size * 2 + h}, {x: X - size * 2 - w, y: Y}, {x: X, y: Y - size * 2 - h}, {x: X + size * 2 + w, y: Y}][dir];
            xy.path = p;
            if (withAnimation) {
                this.animate(xy, 500, ">");
            } else {
                this.attr(xy);
            }
            return this;
        };
        return res.update(x, y);
    };
    Raphael.fn.g.flag = function (x, y, text, angle) {
        angle = angle || 0;
        text = text || "$9.99";
        var res = this.set(),
            d = 3;
        res.push(this.path().attr({fill: "#000", stroke: "#000"}));
        res.push(this.text(x, y, text).attr(this.g.txtattr).attr({fill: "#fff", "font-family": "Helvetica, Arial"}));
        res.update = function (x, y) {
            this.rotate(0, x, y);
            var bb = this[1].getBBox(),
                h = bb.height / 2;
            this[0].attr({path: ["M", x, y, "l", h + d, -h - d, bb.width + 2 * d, 0, 0, bb.height + 2 * d, -bb.width - 2 * d, 0, "z"].join(",")});
            this[1].attr({x: x + h + d + bb.width / 2, y: y});
            angle = 360 - angle;
            this.rotate(angle, x, y);
            angle > 90 && angle < 270 && this[1].attr({x: x - r - d - bb.width / 2, y: y, rotation: [180 + angle, x, y]});
            return this;
        };
        return res.update(x, y);
    };
    Raphael.fn.g.label = function (x, y, text) {
        var res = this.set();
        res.push(this.rect(x, y, 10, 10).attr({stroke: "none", fill: "#000"}));
        res.push(this.text(x, y, text).attr(this.g.txtattr).attr({fill: "#fff"}));
        res.update = function () {
            var bb = this[1].getBBox(),
                r = mmin(bb.width + 10, bb.height + 10) / 2;
            this[0].attr({x: bb.x - r / 2, y: bb.y - r / 2, width: bb.width + r, height: bb.height + r, r: r});
        };
        res.update();
        return res;
    };
    Raphael.fn.g.labelit = function (set) {
        var bb = set.getBBox(),
            r = mmin(20, bb.width + 10, bb.height + 10) / 2;
        return this.rect(bb.x - r / 2, bb.y - r / 2, bb.width + r, bb.height + r, r).attr({stroke: "none", fill: "#000"}).insertBefore(set.node ? set : set[0]);
    };
    Raphael.fn.g.drop = function (x, y, text, size, angle) {
        size = size || 30;
        angle = angle || 0;
        var res = this.set();
        res.push(this.path(["M", x, y, "l", size, 0, "A", size * .4, size * .4, 0, 1, 0, x + size * .7, y - size * .7, "z"]).attr({fill: "#000", stroke: "none", rotation: [22.5 - angle, x, y]}));
        angle = (angle + 90) * Math.PI / 180;
        res.push(this.text(x + size * Math.sin(angle), y + size * Math.cos(angle), text).attr(this.g.txtattr).attr({"font-size": size * 12 / 30, fill: "#fff"}));
        res.drop = res[0];
        res.text = res[1];
        return res;
    };
    Raphael.fn.g.blob = function (x, y, text, angle, size) {
        angle = (+angle + 1 ? angle : 45) + 90;
        size = size || 12;
        var rad = Math.PI / 180,
            fontSize = size * 12 / 12;
        var res = this.set();
        res.push(this.path().attr({fill: "#000", stroke: "none"}));
        res.push(this.text(x + size * Math.sin((angle) * rad), y + size * Math.cos((angle) * rad) - fontSize / 2, text).attr(this.g.txtattr).attr({"font-size": fontSize, fill: "#fff"}));
        res.update = function (X, Y, withAnimation) {
            X = X || x;
            Y = Y || y;
            var bb = this[1].getBBox(),
                w = mmax(bb.width + fontSize, size * 25 / 12),
                h = mmax(bb.height + fontSize, size * 25 / 12),
                x2 = X + size * Math.sin((angle - 22.5) * rad),
                y2 = Y + size * Math.cos((angle - 22.5) * rad),
                x1 = X + size * Math.sin((angle + 22.5) * rad),
                y1 = Y + size * Math.cos((angle + 22.5) * rad),
                dx = (x1 - x2) / 2,
                dy = (y1 - y2) / 2,
                rx = w / 2,
                ry = h / 2,
                k = -Math.sqrt(Math.abs(rx * rx * ry * ry - rx * rx * dy * dy - ry * ry * dx * dx) / (rx * rx * dy * dy + ry * ry * dx * dx)),
                cx = k * rx * dy / ry + (x1 + x2) / 2,
                cy = k * -ry * dx / rx + (y1 + y2) / 2;
            if (withAnimation) {
                this.animate({x: cx, y: cy, path: ["M", x, y, "L", x1, y1, "A", rx, ry, 0, 1, 1, x2, y2, "z"].join(",")}, 500, ">");
            } else {
                this.attr({x: cx, y: cy, path: ["M", x, y, "L", x1, y1, "A", rx, ry, 0, 1, 1, x2, y2, "z"].join(",")});
            }
            return this;
        };
        res.update(x, y);
        return res;
    };

    Raphael.fn.g.colorValue = function (value, total, s, b) {
        return "hsb(" + [mmin((1 - value / total) * .4, 1), s || .75, b || .75] + ")";
    };

    Raphael.fn.g.snapEnds = function (from, to, steps) {
        var f = from,
            t = to;
        if (f == t) {
            return {from: f, to: t, power: 0};
        }
        function round(a) {
            return Math.abs(a - .5) < .25 ? ~~(a) + .5 : Math.round(a);
        }
        var d = (t - f) / steps,
            r = ~~(d),
            R = r,
            i = 0;
        if (r) {
            while (R) {
                i--;
                R = ~~(d * Math.pow(10, i)) / Math.pow(10, i);
            }
            i ++;
        } else {
            while (!r) {
                i = i || 1;
                r = ~~(d * Math.pow(10, i)) / Math.pow(10, i);
                i++;
            }
            i && i--;
        }
        t = round(to * Math.pow(10, i)) / Math.pow(10, i);
        if (t < to) {
            t = round((to + .5) * Math.pow(10, i)) / Math.pow(10, i);
        }
        f = round((from - (i > 0 ? 0 : .5)) * Math.pow(10, i)) / Math.pow(10, i);
        return {from: f, to: t, power: i};
    };
    Raphael.fn.g.axis = function (x, y, length, from, to, steps, orientation, labels, type, dashsize) {
        dashsize = dashsize == null ? 2 : dashsize;
        type = type || "t";
        steps = steps || 10;
        var path = type == "|" || type == " " ? ["M", x + .5, y, "l", 0, .001] : orientation == 1 || orientation == 3 ? ["M", x + .5, y, "l", 0, -length] : ["M", x, y + .5, "l", length, 0],
            ends = this.g.snapEnds(from, to, steps),
            f = ends.from,
            t = ends.to,
            i = ends.power,
            j = 0,
            text = this.set();
        d = (t - f) / steps;
        var label = f,
            rnd = i > 0 ? i : 0;
            dx = length / steps;
        if (+orientation == 1 || +orientation == 3) {
            var Y = y,
                addon = (orientation - 1 ? 1 : -1) * (dashsize + 3 + !!(orientation - 1));
            while (Y >= y - length) {
                type != "-" && type != " " && (path = path.concat(["M", x - (type == "+" || type == "|" ? dashsize : !(orientation - 1) * dashsize * 2), Y + .5, "l", dashsize * 2 + 1, 0]));
                text.push(this.text(x + addon, Y, (labels && labels[j++]) || (Math.round(label) == label ? label : +label.toFixed(rnd))).attr(this.g.txtattr).attr({"text-anchor": orientation - 1 ? "start" : "end"}));
                label += d;
                Y -= dx;
            }
            if (Math.round(Y + dx - (y - length))) {
                type != "-" && type != " " && (path = path.concat(["M", x - (type == "+" || type == "|" ? dashsize : !(orientation - 1) * dashsize * 2), y - length + .5, "l", dashsize * 2 + 1, 0]));
                text.push(this.text(x + addon, y - length, (labels && labels[j]) || (Math.round(label) == label ? label : +label.toFixed(rnd))).attr(this.g.txtattr).attr({"text-anchor": orientation - 1 ? "start" : "end"}));
            }
        } else {
            label = f;
            rnd = (i > 0) * i;
            addon = (orientation ? -1 : 1) * (dashsize + 9 + !orientation);
            var X = x,
                dx = length / steps,
                txt = 0,
                prev = 0;
            while (X <= x + length) {
                type != "-" && type != " " && (path = path.concat(["M", X + .5, y - (type == "+" ? dashsize : !!orientation * dashsize * 2), "l", 0, dashsize * 2 + 1]));
                text.push(txt = this.text(X, y + addon, (labels && labels[j++]) || (Math.round(label) == label ? label : +label.toFixed(rnd))).attr(this.g.txtattr));
                var bb = txt.getBBox();
                if (prev >= bb.x - 5) {
                    text.pop(text.length - 1).remove();
                } else {
                    prev = bb.x + bb.width;
                }
                label += d;
                X += dx;
            }
            if (Math.round(X - dx - x - length)) {
                type != "-" && type != " " && (path = path.concat(["M", x + length + .5, y - (type == "+" ? dashsize : !!orientation * dashsize * 2), "l", 0, dashsize * 2 + 1]));
                text.push(this.text(x + length, y + addon, (labels && labels[j]) || (Math.round(label) == label ? label : +label.toFixed(rnd))).attr(this.g.txtattr));
            }
        }
        var res = this.path(path);
        res.text = text;
        res.all = this.set([res, text]);
        res.remove = function () {
            this.text.remove();
            this.constructor.prototype.remove.call(this);
        };
        return res;
    };

    Raphael.el.lighter = function (times) {
        times = times || 2;
        var fs = [this.attrs.fill, this.attrs.stroke];
        this.fs = this.fs || [fs[0], fs[1]];
        fs[0] = Raphael.rgb2hsb(Raphael.getRGB(fs[0]).hex);
        fs[1] = Raphael.rgb2hsb(Raphael.getRGB(fs[1]).hex);
        fs[0].b = mmin(fs[0].b * times, 1);
        fs[0].s = fs[0].s / times;
        fs[1].b = mmin(fs[1].b * times, 1);
        fs[1].s = fs[1].s / times;
        this.attr({fill: "hsb(" + [fs[0].h, fs[0].s, fs[0].b] + ")", stroke: "hsb(" + [fs[1].h, fs[1].s, fs[1].b] + ")"});
    };
    Raphael.el.darker = function (times) {
        times = times || 2;
        var fs = [this.attrs.fill, this.attrs.stroke];
        this.fs = this.fs || [fs[0], fs[1]];
        fs[0] = Raphael.rgb2hsb(Raphael.getRGB(fs[0]).hex);
        fs[1] = Raphael.rgb2hsb(Raphael.getRGB(fs[1]).hex);
        fs[0].s = mmin(fs[0].s * times, 1);
        fs[0].b = fs[0].b / times;
        fs[1].s = mmin(fs[1].s * times, 1);
        fs[1].b = fs[1].b / times;
        this.attr({fill: "hsb(" + [fs[0].h, fs[0].s, fs[0].b] + ")", stroke: "hsb(" + [fs[1].h, fs[1].s, fs[1].b] + ")"});
    };
    Raphael.el.original = function () {
        if (this.fs) {
            this.attr({fill: this.fs[0], stroke: this.fs[1]});
            delete this.fs;
        }
    };
})();
/**
 * g.pie Raphael - eXXcellent version
 * Extended to be used in echo3 Framework
 *
 * ---------------------------------------------------------------------------------------
 * Original version:
 * g.Raphael 0.4.1 - Charting library, based on Raphaël
 *
 * Copyright (c) 2009 Dmitry Baranovskiy (http://g.raphaeljs.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 * ---------------------------------------------------------------------------------------
 *
 * @author Ralf Enderle <r.enderle@exxcellent.de>
 * @version 1.0
 */

/**
 * Construct a piechart
 *
 * @param cx - xOffset
 * @param cy - yOffset
 * @param r - radius
 * @param values - pieValues [will be an Array of exxcellent.model.PieSector]
 * @param valuesToIgnore - the pieValues with ZERO-value, will be ignored in most cases
 * @param opts - the options, contains also the legend
 * @param style - echo-specific styling
 */
Raphael.fn.g.piechart = function (cx, cy, r, values, valuesToIgnore, opts, style) {
    opts = opts || {};
    var paper = this,
            sectors = [],
            covers = this.set(),
            chart = this.set(),
            series = this.set(),
            order = [],
            len = values.length,
            angle = 0,
            total = 0,
            others = 0,
            cut = 24, // maximum of segments
            defcut = true;
    chart.covers = covers;

    var fallbackColorFactory = style.nextFallbackColor();

    for (var i = 0; i < valuesToIgnore.length; i++) {
        valuesToIgnore[i] = {label: opts.legend[len+i], value: valuesToIgnore[i].value,  order: i, name: valuesToIgnore[i].name, abbreviation: valuesToIgnore[i].abbreviation, abbreviationForeground: valuesToIgnore[i].abbreviationForeground, popUpLabel: valuesToIgnore[i].popUpLabel, color: valuesToIgnore[i].color, identifier: valuesToIgnore[i].identifier, valueOf: function () {
                                           return this.value;
        }};

    }

    if (len == 1) {
        values[0] = {value: values[0].value,  order: 0, name: values[0].name, abbreviation: values[0].abbreviation, abbreviationForeground: values[0].abbreviationForeground, popUpLabel: values[0].popUpLabel, color: values[0].color, identifier: values[0].identifier, valueOf: function () {
            return this.value;
        }};

        series.push(this.circle(cx, cy, r).attr({fill: values[0].color || fallbackColorFactory(), stroke: opts.stroke || "#fff", "stroke-width": opts.strokewidth == null ? 1 : opts.strokewidth}));
        covers.push(this.circle(cx, cy, r).attr(this.g.shim));

        total = values[0].value;
        series[0].middle = {x: cx, y: cy};
        series[0].mangle = 180;
        series[0].value = values[0];

        if (style.sectorAbbrevShow) {
            // let's print it in the middle of the actual path we defined
            var abbrevTextFill = {fill: values[0].abbreviationForeground || style.sectorAbbrevForeground};
            var abbrevFont = style.sectorAbbrevFont;
            paper.text(cx, cy, values[0].abbreviation).attr(abbrevFont).attr(abbrevTextFill);
        }
    }
    else {
        function sector(cx, cy, r, startAngle, endAngle, fill) {
            var rad = Math.PI / 180,
                    x1 = cx + r * Math.cos(-startAngle * rad),
                    x2 = cx + r * Math.cos(-endAngle * rad),
                    xm = cx + r / 2 * Math.cos(-(startAngle + (endAngle - startAngle) / 2) * rad),
                    y1 = cy + r * Math.sin(-startAngle * rad),
                    y2 = cy + r * Math.sin(-endAngle * rad),
                    ym = cy + r / 2 * Math.sin(-(startAngle + (endAngle - startAngle) / 2) * rad),
                    res = ["M", cx, cy, "L", x1, y1, "A", r, r, 0, +(Math.abs(endAngle - startAngle) > 180), 1, x2, y2, "z"];
            res.middle = {x: xm, y: ym};
            return res;
        }

        for (var i = 0; i < len; i++) {
            // we sum up all values to get the whole
            total += values[i].value;
            values[i] = {value: values[i].value,  order: i, name: values[i].name, abbreviation: values[i].abbreviation, abbreviationForeground: values[i].abbreviationForeground, popUpLabel: values[i].popUpLabel, color: values[i].color, identifier: values[i].identifier, valueOf: function () {
                return this.value;
            }};
        }

        if(style.doClientSorting) {
            // when doing clientSorting we sort from big to small to show the biggest sector at top
            // *WARNING*: only if client sorting is enabled, small sectors < 1.5° are accumulated and categorized as "Other"
            // This should probably be changed and implemented properly in the future
            values.sort(function (a, b) {
                return b.value - a.value;
            });
            for (i = 0; i < len; i++) {
                if (defcut && values[i].value != 0 && values[i].value * 360 / total <= 1.5) {
                    cut = i;
                    defcut = false;
                }
                if (i > cut) {
                    defcut = false;
                    values[cut].value += values[i];
                    values[cut].others = true;
                    others = values[cut].value;
                }
            }
        }
        len = Math.min(cut + 1, values.length);
        others && values.splice(len) && (values[cut].others = true);
        for (i = 0; i < len; i++) {

            var mangle = angle - 360 * values[i].value / total / 2;
            if (!i) {
                angle = 90 - mangle;
                mangle = angle - 360 * values[i].value / total / 2;
            }
            if (opts.init) {
                var ipath = sector(cx, cy, 1, angle, angle - 360 * values[i].value / total).join(",");
            }
            var path = sector(cx, cy, r, angle, angle -= 360 * values[i].value / total);
            var p = this.path(opts.init ? ipath : path).attr({fill: values[i].color || fallbackColorFactory(), stroke: opts.stroke || "#fff", "stroke-width": (opts.strokewidth == null ? 1 : opts.strokewidth), "stroke-linejoin": "round"});
            p.value = values[i];
            p.middle = path.middle;
            p.mangle = mangle;
            sectors.push(p);
            series.push(p);
            opts.init && p.animate({path: path.join(",")}, (+opts.init - 1) || style.animationDuration, ">");


            // maybe we wanna have some text in the sectors
            if (style.sectorAbbrevShow) {
                // let's print it in the middle of the actual path we defined
                var abbrevTextFill = {fill: values[i].abbreviationForeground || style.sectorAbbrevForeground};
                var abbrevFont = style.sectorAbbrevFont;
                paper.text(p.middle.x, p.middle.y, values[i].abbreviation).attr(abbrevFont).attr(abbrevTextFill);
            }
        }
        for (i = 0; i < len; i++) {
            p = paper.path(sectors[i].attr("path")).attr(this.g.shim);
            opts.href && opts.href[i] && p.attr({href: opts.href[i]});
            p.attr = function () {
            };
            covers.push(p);
            series.push(p);
        }
    }

    /**
     * Callback for hover
     * @param fin - In-Callback
     * @param fout - Out-Callback
     */
    chart.hover = function (fin, fout) {
        fout = fout || function () {
        };
        var that = this;
        for (var i = 0; i < len; i++) {
            (function (sector, cover, j) {
                var o = {
                    sector: sector,
                    cover: cover,
                    cx: cx,
                    cy: cy,
                    mx: sector.middle.x,
                    my: sector.middle.y,
                    mangle: sector.mangle,
                    r: r,
                    value: values[j],
                    total: total,
                    label: that.labels && that.labels[j]
                };
                cover.mouseover(
                        function () {
                            fin.call(o);
                        }).mouseout(function () {
                    fout.call(o);
                });
            })(series[i], covers[i], i);
        }
        return this;
    };

    /**
     * Callback - will be applied to all sectors
     * @param f - the callback function
     */
    chart.each = function (f) {
        var that = this;
        for (var i = 0; i < len; i++) {
            (function (sector, cover, j) {
                var o = {
                    sector: sector,
                    cover: cover,
                    cx: cx,
                    cy: cy,
                    x: sector.middle.x,
                    y: sector.middle.y,
                    mangle: sector.mangle,
                    r: r,
                    value: values[j],
                    total: total,
                    label: that.labels && that.labels[j]
                };
                f.call(o);
            })(series[i], covers[i], i);
        }
        return this;
    };

    /**
     * Callback to handle a click of a sector
     * @param f - callback function that will be triggered by clicking a sector
     */
    chart.click = function (f) {
        var that = this;
        for (var i = 0; i < len; i++) {
            (function (sector, cover, j) {
                var o = {
                    sector: sector,
                    cover: cover,
                    cx: cx,
                    cy: cy,
                    mx: sector.middle.x,
                    my: sector.middle.y,
                    mangle: sector.mangle,
                    r: r,
                    value: values[j],
                    total: total,
                    label: that.labels && that.labels[j]
                };
                cover.click(function () {
                    f.call(o);
                });
            })(series[i], covers[i], i);
        }
        return this;
    };

    /**
     * Inject a sector dynamically
     * <i>Untested in this echo3 use</i>
     * @param element - the element you want to add
     */
    chart.inject = function (element) {
        element.insertBefore(covers[0]);
    };

    /**
     * Drawing the legend of the pie
     * @param labels
     * @param otherslabel
     * @param mark
     * @param dir
     */
    var legend = function (labels, otherslabel, mark, dir) {
        var x = cx + r + r / 5,
                y = cy,
                h = y + 10;
        labels = labels || [];
        dir = (dir && dir.toLowerCase && dir.toLowerCase()) || "east";
        mark = paper.g.markers[mark && mark.toLowerCase()] || "disc";
        chart.labels = paper.set();
        for (var i = 0; i < len; i++) {
            // if it's a label that fits to a values-Object:
            if (i < len) {
                var clr = series[i].attr("fill"),
                        j = values[i].order,
                        txt;
                values[i].others && (labels[j] = otherslabel || "Others");
                labels[j] = paper.g.labelise(labels[j], values[i], total);
                chart.labels.push(paper.set());
                chart.labels[i].push(paper.g[mark](x + 5, h, 5).attr({fill: clr, stroke: "none"}));
                chart.labels[i].push(txt = paper.text(x + 20, h, labels[j] || values[j]).attr(style.legendFont || paper.g.txtattr).attr({fill: opts.legendcolor || "#000", "text-anchor": "start"}));
                covers[i].label = chart.labels[i];
                h += txt.getBBox().height * style.legendGapFactor;
            }
        }
        if (!style.legendHideZeroValues) {
            for (var i = 0; i < valuesToIgnore.length; i++) {
                var clr = valuesToIgnore[i].color || fallbackColorFactory(),
                        txt;
                labels[len + i] = paper.g.labelise(valuesToIgnore[i].label, valuesToIgnore[i], (total === 0 ? 1 : total)); // we labelise with ZERO
                chart.labels.push(paper.set());
                chart.labels[len + i].push(paper.g[mark](x + 5, h, 5).attr({fill: clr, stroke: "none"}));
                chart.labels[len + i].push(txt = paper.text(x + 20, h, labels[len+i] || 0).attr(style.legendFont || paper.g.txtattr).attr({fill: opts.legendcolor || "#000", "text-anchor": "start"}));
                h += txt.getBBox().height * style.legendGapFactor;
            }
        }
        var bb = chart.labels.getBBox(),
                tr = {
                    east: [0, -bb.height / 2],
                    west: [-bb.width - 2 * r - 20, -bb.height / 2],
                    north: [-r - bb.width / 2, -r - bb.height - 10],
                    south: [-r - bb.width / 2, r + 10]
                }[dir];
        chart.labels.translate.apply(chart.labels, tr);
        chart.push(chart.labels);
    };
    if (opts.legend) {
        legend(opts.legend, opts.legendothers, opts.legendmark, opts.legendpos);
    }
    chart.push(series, covers);
    chart.series = series;
    chart.covers = covers;
    return chart;
};
/**
 * g.bar - eXXcellent version
 * Extended to be used in echo3 Framework
 *
 * ---------------------------------------------------------------------------------------
 * Original version:
 * g.Raphael 0.4.1 - Charting library, based on Raphaël
 *
 * Copyright (c) 2009 Dmitry Baranovskiy (http://g.raphaeljs.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 * ---------------------------------------------------------------------------------------
 *
 * @author Ralf Enderle <r.enderle@exxcellent.de>
 * @version 1.0
 */

/**
 * Construct a vertical barChart
 *
 *  _
 * | |       _
 * | |  _   | |
 * | | | |  | |
 * | | | |  | |
 * -------------
 *
 * @param x - vertical gap
 * @param y - horizontal gap
 * @param width - the width fo the whole chart
 * @param height - the height fo the whole chart
 * @param values - different values as array of array of 'echo.model.bar'
 * @param opts - different options, just have a deep look at the code to find them :-)
 */
Raphael.fn.g.barchart = function (x, y, width, height, values, opts, barChartModel) {
    opts = opts || {};
    var type = {round: "round", sharp: "sharp", soft: "soft"}[opts.type] || "square",
        // the gutter specifies the empty space between the bars:
        // e.g.  _         _
        //      | |gutter | |
        //      |_|       |_|
            gutter = parseFloat(opts.gutter || "20%"),
            chart = this.set(),
            bars = this.set(),
            covers = this.set(),
            covers2 = this.set(),
        // the max-value of all bars
        //total = Math.max.apply(Math, barChartModel.getAllValues()),
            total = Math.max.apply(Math, this.exx.getAllValues(barChartModel)),
            stacktotal = [],
            paper = this,
            multi = 0,
            colors = opts.colors || this.g.colors,
            len = barChartModel.barValues.length,
        // Array of Array of bars
            barValues = barChartModel.barValues;

    for (var i = 0; i < barValues.length; i++) {
        for (var j = 0; j < barValues[i].length; j++) {
            if (barValues[i][j] === null) {
                barValues[i][j] = new exxcellent.model.Bar(0, null, null, null);
            }
        }
    }

    if (this.raphael.is(barValues[0], "array")) {
        total = [];
        multi = len;
        len = 0;
        for (var i = barValues.length; i--;) {
            bars.push(this.set());
            total.push(Math.max.apply(Math, this.exx.getSpecifiedBarValues(barChartModel, i)));
            len = Math.max(len, barValues[i].length);
        }
        // if we have a multiBar with some arrays, smaller than maximum, we fill with dummies
        for (var i = barValues.length; i--;) {
            if (barValues[i].length < len) {
                for (var j = len - barValues[i].length; j--;) {
                    barValues[i].push(new exxcellent.model.Bar(0));
                }
            }
        }
        if (opts.stacked) {
            for (var i = len; i--;) {
                var tot = 0;
                for (var j = barValues.length; j--;) {
                    tot += + barValues[j][i].value || 0;
                }
                stacktotal.push(tot);
            }
        }

        total = Math.max.apply(Math, opts.stacked ? stacktotal : total);
    }

    total = (opts.to) || total;
    var barwidth = width / (len * (100 + gutter) + gutter) * 100,
            barhgutter = barwidth * gutter / 100,
            barvgutter = opts.vgutter == null ? 20 : opts.vgutter,
            stack = [],
            X = x + barhgutter,
            Y = (height - 2 * barvgutter) / total;
    if (!opts.stretch) {
        barhgutter = Math.round(barhgutter);
        barwidth = Math.floor(barwidth);
    }
    !opts.stacked && (barwidth /= multi || 1);
    for (var i = 0; i < len; i++) {
        stack = [];
        for (var j = 0; j < (multi || 1); j++) {
            var h = Math.round((multi ? barValues[j][i].value : values[i]) * Y),
                    top = y + height - barvgutter - h,
                    bar = this.g.finger(Math.round(X + barwidth / 2), top + h, barwidth, h, true, type).attr({stroke: "none", fill: barValues[j][i].color ? barValues[j][i].color : (colors[multi ? j : i])});
            if (multi) {
                bars[j].push(bar);
            } else {
                bars.push(bar);
            }
            bar.y = top;
            bar.x = Math.round(X + barwidth / 2);
            bar.w = barwidth;
            bar.h = h;
            bar.value = multi ? barValues[j][i].value : values[i];
            bar.Bar = barValues[j][i];
            if (!opts.stacked) {
                X += barwidth;
            } else {
                stack.push(bar);
            }
        }
        if (opts.stacked) {
            var cvr;
            covers2.push(cvr = this.rect(stack[0].x - stack[0].w / 2, y, barwidth, height).attr(this.g.shim));
            cvr.bars = this.set();
            var size = 0;
            for (var s = stack.length; s--;) {
                stack[s].toFront();
            }
            for (var s = 0, ss = stack.length; s < ss; s++) {
                var bar = stack[s],
                        cover,
                        h = (size + bar.value) * Y,
                        path = this.g.finger(bar.x, y + height - barvgutter - !!size * .5, barwidth, h, true, type, 1);
                cvr.bars.push(bar);
                size && bar.attr({path: path});
                bar.h = h;
                bar.y = y + height - barvgutter - !!size * .5 - h;
                covers.push(cover = this.rect(bar.x - bar.w / 2, bar.y, barwidth, bar.value * Y).attr(this.g.shim));
                // show tooltips or not?
                if (opts.showTooltip) {
                    cover.attr({title: bar.Bar.label});
                }
                cover.bar = bar;
                cover.value = bar.value;
                size += bar.value;
            }
            X += barwidth;
        }
        X += barhgutter;
    }
    covers2.toFront();
    X = x + barhgutter;
    if (!opts.stacked) {
        for (var i = 0; i < len; i++) {
            for (var j = 0; j < (multi || 1); j++) {
                var cover;
                covers.push(cover = this.rect(Math.round(X), y + barvgutter, barwidth, height - barvgutter).attr(this.g.shim));
                // show tooltips or not?
                bar = multi ? bars[j][i] : bars[i];
                if (opts.showTooltip) {
                    cover.attr({title: bar.Bar.label});
                }
                cover.bar = bar;
                cover.value = cover.bar.value;
                X += barwidth;
            }
            X += barhgutter;
        }
    }
    chart.label = function (labels, isBottom) {
        labels = labels || [];
        this.labels = paper.set();
        var L, l = -Infinity;
        if (opts.stacked) {
            for (var i = 0; i < len; i++) {
                var tot = 0;
                for (var j = 0; j < (multi || 1); j++) {
                    tot += multi ? values[j][i] : values[i];
                    if (j == multi - 1) {
                        var label = paper.g.labelise(labels[i], tot, total);
                        L = paper.g.text(bars[i * (multi || 1) + j].x, y + height - barvgutter / 2, label).insertBefore(covers[i * (multi || 1) + j]);
                        var bb = L.getBBox();
                        if (bb.x - 7 < l) {
                            L.remove();
                        } else {
                            this.labels.push(L);
                            l = bb.x + bb.width;
                        }
                    }
                }
            }
        } else {
            for (var i = 0; i < len; i++) {
                for (var j = 0; j < (multi || 1); j++) {
                    var label = paper.g.labelise(multi ? labels[j] && labels[j][i] : labels[i], multi ? values[j][i] : values[i], total);
                    L = paper.g.text(bars[i * (multi || 1) + j].x, isBottom ? y + height - barvgutter / 2 : bars[i * (multi || 1) + j].y - 10, label).insertBefore(covers[i * (multi || 1) + j]);
                    var bb = L.getBBox();
                    if (bb.x - 7 < l) {
                        L.remove();
                    } else {
                        this.labels.push(L);
                        l = bb.x + bb.width;
                    }
                }
            }
        }
        return this;
    };
    chart.hover = function (fin, fout) {
        covers2.hide();
        covers.show();
        covers.mouseover(fin).mouseout(fout);
        return this;
    };
    chart.hoverColumn = function (fin, fout) {
        covers.hide();
        covers2.show();
        fout = fout || function () {
        };
        covers2.mouseover(fin).mouseout(fout);
        return this;
    };
    chart.click = function (f) {
        covers2.hide();
        covers.show();
        covers.click(f);
        return this;
    };
    chart.each = function (f) {
        if (!Raphael.is(f, "function")) {
            return this;
        }
        for (var i = covers.length; i--;) {
            f.call(covers[i]);
        }
        return this;
    };
    chart.eachColumn = function (f) {
        if (!Raphael.is(f, "function")) {
            return this;
        }
        for (var i = covers2.length; i--;) {
            f.call(covers2[i]);
        }
        return this;
    };
    chart.clickColumn = function (f) {
        covers.hide();
        covers2.show();
        covers2.click(f);
        return this;
    };
    chart.push(bars, covers, covers2);
    chart.bars = bars;
    chart.covers = covers;
    return chart;
};

/**
 * Construct a horizontal barChart
 *
 * |_______
 * |_______|
 * |____________
 * |____________|
 * |___
 * |___|
 * |
 *
 *
 * @param x - vertical gap
 * @param y - horizontal gap
 * @param width - the width fo the whole chart
 * @param height - the height fo the whole chart
 * @param values - different values as array (different values could contain an array too
 * @param opts - different options, just have a deep look at the code to find them :-)
 */
Raphael.fn.g.hbarchart = function (x, y, width, height, values, opts, barChartModel) {
    opts = opts || {};
    var type = {round: "round", sharp: "sharp", soft: "soft"}[opts.type] || "square",
            gutter = parseFloat(opts.gutter || "20%"),
            chart = this.set(),
            bars = this.set(),
            covers = this.set(),
            covers2 = this.set(),
        // the max-value of all bars
            total = Math.max.apply(Math, this.exx.getAllValues(barChartModel)),
            stacktotal = [],
            paper = this,
            multi = 0,
            colors = opts.colors || this.g.colors,
            len = barChartModel.barValues.length,
        // Array of Array of bars
            barValues = barChartModel.barValues;

    for (var i = 0; i < barValues.length; i++) {
        for (var j = 0; j < barValues[i].length; j++) {
            if (barValues[i][j] === null) {
                barValues[i][j] = new exxcellent.model.Bar(0, null, null, null);
            }
        }
    }

    if (this.raphael.is(barValues[0], "array")) {
        total = [];
        multi = len;
        len = 0;
        for (var i = barValues.length; i--;) {
            bars.push(this.set());
            total.push(Math.max.apply(Math, this.exx.getSpecifiedBarValues(barChartModel, i)));
            len = Math.max(len, barValues[i].length);
        }
        // if we have a multiBar with some arrays, smaller than maximum, we fill with dummies
        for (var i = barValues.length; i--;) {
            if (barValues[i].length < len) {
                for (var j = len - barValues[i].length; j--;) {
                    barValues[i].push(new exxcellent.model.Bar(0));
                }
            }
        }
        if (opts.stacked) {
            for (var i = len; i--;) {
                var tot = 0;
                for (var j = barValues.length; j--;) {
                    tot += + barValues[j][i].value || 0;
                }
                stacktotal.push(tot);
            }
        }

        total = Math.max.apply(Math, opts.stacked ? stacktotal : total);
    }

    total = (opts.to) || total;
    var barheight = Math.floor(height / (len * (100 + gutter) + gutter) * 100),
            bargutter = Math.floor(barheight * gutter / 100),
            stack = [],
            Y = y + bargutter,
            X = (width - 1) / total;
    !opts.stacked && (barheight /= multi || 1);
    for (var i = 0; i < len; i++) {
        stack = [];
        for (var j = 0; j < (multi || 1); j++) {
            var val = multi ? barValues[j][i].value : values[i],
                    bar = this.g.finger(x, Y + barheight / 2, Math.round(val * X), barheight - 1, false, type).attr({stroke: "none", fill: barValues[j][i].color ? barValues[j][i].color : (colors[multi ? j : i])});
            if (multi) {
                bars[j].push(bar);
            } else {
                bars.push(bar);
            }
            bar.x = x + Math.round(val * X);
            bar.y = Y + barheight / 2;
            bar.w = Math.round(val * X);
            bar.h = barheight;
            bar.value = +val;
            // we add exxcellent.model.Bar to the raphael-Object
            bar.Bar = barValues[j][i];
            if (!opts.stacked) {
                Y += barheight;
            } else {
                stack.push(bar);
            }
        }
        if (opts.stacked) {
            var cvr = this.rect(x, stack[0].y - stack[0].h / 2, width, barheight).attr(this.g.shim);
            covers2.push(cvr);
            cvr.bars = this.set();
            var size = 0;
            for (var s = stack.length; s--;) {
                stack[s].toFront();
            }
            for (var s = 0, ss = stack.length; s < ss; s++) {
                var bar = stack[s],
                        cover,
                        val = Math.round((size + bar.value) * X),
                        path = this.g.finger(x, bar.y, val, barheight - 1, false, type, 1);
                cvr.bars.push(bar);
                size && bar.attr({path: path});
                bar.w = val;
                bar.x = x + val;
                covers.push(cover = this.rect(x + size * X, bar.y - bar.h / 2, bar.value * X, barheight).attr(this.g.shim));
                // show tooltips or not?
                if (opts.showTooltip) {
                    cover.attr({title: bar.Bar.label});
                }
                cover.bar = bar;
                size += bar.value;
            }
            Y += barheight;
        }
        Y += bargutter;
    }
    covers2.toFront();
    Y = y + bargutter;
    if (!opts.stacked) {
        for (var i = 0; i < len; i++) {
            for (var j = 0; j < (multi || 1); j++) {
                var cover = this.rect(x, Y, width, barheight).attr(this.g.shim);
                covers.push(cover);
                // show tooltips or not?
                bar =  multi ? bars[j][i] : bars[i];
                if (opts.showTooltip) {
                    cover.attr({title: bar.Bar.label});
                }
                cover.bar = bar;
                cover.value = cover.bar.value;
                Y += barheight;
            }
            Y += bargutter;
        }
    }
    chart.label = function (labels, isRight) {
        labels = labels || [];
        this.labels = paper.set();
        for (var i = 0; i < len; i++) {
            for (var j = 0; j < multi; j++) {
                var label = paper.g.labelise(multi ? labels[j] && labels[j][i] : labels[i], multi ? values[j][i] : values[i], total);
                var X = isRight ? bars[i * (multi || 1) + j].x - barheight / 2 + 3 : x + 5,
                        A = isRight ? "end" : "start",
                        L;
                this.labels.push(L = paper.g.text(X, bars[i * (multi || 1) + j].y, label).attr({"text-anchor": A}).insertBefore(covers[0]));
                if (L.getBBox().x < x + 5) {
                    L.attr({x: x + 5, "text-anchor": "start"});
                } else {
                    bars[i * (multi || 1) + j].label = L;
                }
            }
        }
        return this;
    };
    chart.hover = function (fin, fout) {
        covers2.hide();
        covers.show();
        fout = fout || function () {
        };
        covers.mouseover(fin).mouseout(fout);
        return this;
    };
    chart.hoverColumn = function (fin, fout) {
        covers.hide();
        covers2.show();
        fout = fout || function () {
        };
        covers2.mouseover(fin).mouseout(fout);
        return this;
    };
    chart.each = function (f) {
        if (!Raphael.is(f, "function")) {
            return this;
        }
        for (var i = covers.length; i--;) {
            f.call(covers[i]);
        }
        return this;
    };
    chart.eachColumn = function (f) {
        if (!Raphael.is(f, "function")) {
            return this;
        }
        for (var i = covers2.length; i--;) {
            f.call(covers2[i]);
        }
        return this;
    };
    chart.click = function (f) {
        covers2.hide();
        covers.show();
        covers.click(f);
        return this;
    };
    chart.clickColumn = function (f) {
        covers.hide();
        covers2.show();
        covers2.click(f);
        return this;
    };
    chart.push(bars, covers, covers2);
    chart.bars = bars;
    chart.covers = covers;
    return chart;
};
/**
 * eXXcellent raphael-Extension library - Version 1.0
 *
 * Some helpful Methods in an extra eXXecellent-NameSpace to draw some nice things with raphael
 *
 * You have to make sure, that the following scripts are already loaded:
 * <code>raphael.js - Version 1.5.2</code>
 * <code>popup.raphael.js - Version 1.0</code>
 * You might use a higher Version of these files, but without any warranty!
 *
 * @author Ralf Enderle
 */
(function() {
    // we create a namespace in Raphael reserved for eXXcellent
    Raphael.fn.exx = Raphael.fn.exx || {};

    /**
     * Draws a Grid !!DRAFT!!
     * @param xOffset
     * @param yOffset
     * @param gridWidth
     * @param gridHeight
     * @param widthScale
     * @param heightScale
     * @param color
     */
    Raphael.fn.exx.drawGrid = function(xOffset, yOffset, lineChartLayout, axisModel) {
        /**
         * Draws something like that on screen:
         *  _ _ _ _
         * |_|_|_|_|
         * |_|_|_|_|
         * |_|_|_|_|
         */
        // we use a Fallback for every variable - this makes it easier to use this function 
        xOffset = xOffset || 0;
        yOffset = yOffset || 0;
        var gridWidth = lineChartLayout.getWidth() || 200;
        var gridHeight = lineChartLayout.getHeight() || 100;
        var widthScale = lineChartLayout.getXaxisSectors() || 10;
        var heightScale = lineChartLayout.getYaxisSectors() || 10;
        var color = lineChartLayout.getGridColor() || "#000";
        var axisForeground = lineChartLayout.getForeground() || '#000';
        var axisFont = lineChartLayout.getAxisFont() || null;
        var path = ["M", Math.round(xOffset) + .5, Math.round(yOffset) + .5, "L", Math.round(xOffset + gridWidth) + .5, Math.round(yOffset) + .5, Math.round(xOffset + gridWidth) + .5, Math.round(yOffset + gridHeight) + .5, Math.round(xOffset) + .5, Math.round(yOffset + gridHeight) + .5, Math.round(xOffset) + .5, Math.round(yOffset) + .5],
                rowHeight = gridHeight / heightScale,
                columnWidth = gridWidth / widthScale;
        for (var i = 1; i < heightScale; i++) {
            path = path.concat(["M", Math.round(xOffset) + .5, Math.round(yOffset + i * rowHeight) + .5, "H", Math.round(xOffset + gridWidth) + .5]);
        }
        for (i = 1; i < widthScale; i++) {
            path = path.concat(["M", Math.round(xOffset + i * columnWidth) + .5, Math.round(yOffset) + .5, "V", Math.round(yOffset + gridHeight) + .5]);
        }

        // --- Draw legendValues for x-y-Axis ---
        // --------------------------------------

        // -- xAxis --
        if (!axisModel || !axisModel.xAxisValues) {
            // Fallback, if axisModel is null or axisModel.xAxisValues is null
            var tmp_x = lineChartLayout.getXscaleMax() / widthScale;
            for (var i = 0; i <= widthScale; i++) {
                this.text((gridWidth / widthScale) * i + xOffset, gridHeight + yOffset + 15, Math.round(tmp_x * i)).attr({fill:axisForeground}).attr(axisFont);
            }
        } else {
            // if we have values for the xAxis, we draw them instead of the dummy-Numbers
            var xAxisArray = axisModel.xAxisValues;
            for (var i = 0; i < xAxisArray.length; i++) {
                this.text((gridWidth / (xAxisArray.length - 1)) * i + xOffset, gridHeight + yOffset + 15, xAxisArray[i]).attr({fill:axisForeground}).attr(axisFont);
            }
        }

        // -- yAxis --
        if (!axisModel || !axisModel.yAxisValues) {
            // Fallback, if axisModel is null or axisModel.yAxisValues is null
            var tmp_y = lineChartLayout.getYscaleMax() / heightScale;
            for (var i = 0; i <= heightScale; i++) {
                this.text(xOffset - 20, (gridHeight / heightScale) * i + yOffset, Math.round(tmp_y * (heightScale - i))).attr({fill:axisForeground}).attr(axisFont);
            }
        } else {
            // if we have values for the yAxis, we draw them instead of the dummy-Numbers
            var yAxisArray = axisModel.yAxisValues;
            for (var i = 0; i < yAxisArray.length; i++) {
                this.text(xOffset - 20, (gridHeight / (yAxisArray.length - 1)) * i + yOffset, yAxisArray[yAxisArray.length - i - 1]).attr({fill:axisForeground}).attr(axisFont);
            }
        }
        return this.path(path.join(",")).attr({stroke: color});
    };


    /**
     * Draws a line - DRAFT!!
     *
     * @param xOffset - xOffset-Value where to start drawing
     * @param yOffset - yOffset-Value where to start drawing
     * @param chartWidth
     * @param chartHeight
     * @param pointArray
     * @param xAxisMax - the maxValue of the xAxis
     * @param yAxisMax - the maxValue of the yAxis
     */
    Raphael.fn.exx.drawLine = function(xOffset, yOffset, pointArray, lineChartLayout, callback) {
        // a reference to this - wo only use tis reference from that time on to keep things clear
        var self = this;
        // some scalingVariables
        var chartWidth = lineChartLayout.getWidth();
        var chartHeight = lineChartLayout.getHeight();
        var xScale = chartWidth / lineChartLayout.getXscaleMax();
        var yScale = chartHeight / lineChartLayout.getYscaleMax();

        var color = lineChartLayout.getLineColor();
        var dotColor = lineChartLayout.getDotColor();
        var showPopup = lineChartLayout.isShowPopup();
        var fillChart = lineChartLayout.fillChart;
        var interpolation = lineChartLayout.getInterpolation() || 'linear';

        // some variables for PopUp
        var popUpBackground = lineChartLayout.getPopupBackground() || '#000';
        var popUpBorderColor = lineChartLayout.getPopupBorderColor() || '#666';
        var popUpForeground = lineChartLayout.getPopupForeground() || '#fff';
        var popUpFont = lineChartLayout.getPopupFont() || {font: '10px Helvetica, Arial'};

        // these functions help you to scale your chart
        // e.g. when your Chart is 300px wide but you want to display a points from 0...4800 on the xAxis you
        // can not just use PIXEL == AxisValue
        // -> this functions will scale for you
        function getScaledX(point) {
            return point.x * xScale;
        }

        function getScaledY(point) {
            return point.y * yScale;
        }

        /**
         * Just a little math-voodoo to draw a smooth line between Points: p1, p2, p3
         * @param p1x
         * @param p1y
         * @param p2x
         * @param p2y
         * @param p3x
         * @param p3y
         *
         * @return an Object containing to point-coordinates x1, y1 and x2, y2
         */
        function getAnchors(p1x, p1y, p2x, p2y, p3x, p3y) {
            // If you have good knowledge of trigonometry it would be nice if you leave some comments
            // here how this little code works :-)
            var l1 = (p2x - p1x) / 2;
            var l2 = (p3x - p2x) / 2;
            var a = Math.atan((p2x - p1x) / Math.abs(p2y - p1y));
            var b = Math.atan((p3x - p2x) / Math.abs(p2y - p3y));
            a = p1y < p2y ? Math.PI - a : a;
            b = p3y < p2y ? Math.PI - b : b;
            var alpha = Math.PI / 2 - ((a + b) % (Math.PI * 2)) / 2;
            var dx1 = l1 * Math.sin(alpha + a);
            var dy1 = l1 * Math.cos(alpha + a);
            var dx2 = l2 * Math.sin(alpha + b);
            var dy2 = l2 * Math.cos(alpha + b);
            return {
                x1: p2x - dx1,
                y1: p2y + dy1,
                x2: p2x + dx2,
                y2: p2y + dy2
            };
        }

        /**
         * Whole window with a chart and one Point
         * |----------------------------|
         * |                            |
         * |    y                       |
         * |    .                       |
         * |    .   *                   | <--- P(x,y) : P(2,3)
         * |    .                       |
         * |    .                       |
         * |    . . . . . . x           |
         * |                            |
         * |----------------------------|
         * Maybe this little picture helps to understand
         */

            // local path-Object - just a little styling now
            // this object is used to paint the later defind array with the values from the pointArray
        var path = self.path().attr({stroke: color, "stroke-width": 4, "stroke-linejoin": "round"});
        var backGroundPanelPath = self.path().attr({stroke: "none", opacity: .3, fill: color});

        // Text-Styling for PopUpLabel
        var popupTextFill = {fill: popUpForeground};

        var leave_timer;
        var is_label_visible = false;
        // the blanket holds the rectangles for mouseOver
        var blanket = self.set();
        var pathArray;
        var backGroundPathArray;
        for (var i = 0, ii = pointArray.length; i < ii; i++) {
            // we calculate the next x and y value of the point to display in this iteration
            // Just a little Mathematics... the display 0-point is on top-left, but we want to draw from
            // bottom-left-corner of the Axis-chart
            var y = Math.round(chartHeight + yOffset - getScaledY(pointArray[i]));
            var x = Math.round(xOffset + getScaledX(pointArray[i]));

            // draw the dots
            var dot = self.circle(x, y, 4).attr({fill: dotColor, stroke: color, "stroke-width": 2});

            // calculate the next pathElements
            if (i === 0) {
                // when it's the first iteration, we have to add the 'StartPoint'...
                // only a path from x:y to itself :-)
                pathArray = ["M", x, y, "C", x, y];

                // some SVG-Logic
                // [M]: we start at Point (0/maxWidth) of the chart then...
                // [L] draw a line to the x-Value of the first Point on the bottom of the chart...
                // [L] draw a line to the first point of the chart
                // [C] and start the cubic-Bezier-curve with the x-y value
                // we will add all the other points of our chartCurve to this cubic-Bezier
                backGroundPathArray = ["M", xOffset + chartWidth, chartHeight + yOffset,"L", x,chartHeight + yOffset , "L", x,y , "C", x, y];
                //backGroundPathArray = ["M", xOffset + chartWidth, chartHeight + yOffset, "L", x,chartHeight + yOffset , "C", x, y];
            }
            if (i && i < ii - 1) {
                // We calculate the plain x/y values for the point before and after...
                var Y0 = Math.round(chartHeight + yOffset - getScaledY(pointArray[i - 1]));
                var X0 = Math.round(xOffset + getScaledX(pointArray[i - 1]));
                var Y2 = Math.round(chartHeight + yOffset - getScaledY(pointArray[i + 1]));
                var X2 = Math.round(xOffset + getScaledX(pointArray[i + 1]));
                // ...then calculate around with some trigonometry...

                var a = getAnchors(X0, Y0, x, y, X2, Y2);
                //var a = getAnchors(x, y, x, y, x, y);
                // ... so that we can draw a smooth line between 'PointBefore'(a.x1/a.y1)...'ActualPoint'(x/y)...'PointAfter'(a.x2/a.y2)
                var tmp_offset = 0;

                if (interpolation == 'bezier') {
                    pathArray = pathArray.concat([a.x1, a.y1, x + tmp_offset, y, a.x2, a.y2]);
                    backGroundPathArray = backGroundPathArray.concat([a.x1, a.y1, x + tmp_offset, y, a.x2, a.y2]);
                } else if (interpolation == 'linear') {
                    pathArray = pathArray.concat([ x + tmp_offset, y, x + tmp_offset, y,  x + tmp_offset, y]);  // <- for drawing just a line between the dots
                    backGroundPathArray = backGroundPathArray.concat([ x + tmp_offset, y, x + tmp_offset, y,  x + tmp_offset, y]);
                } else if (interpolation == 'none') {
                    backGroundPathArray = backGroundPathArray.concat([ x + tmp_offset, y, x + tmp_offset, y,  x + tmp_offset, y]);
                }

            }


            /**
             * In the example they draw a box from top to buttom of the chart with the width going
             * half to the next Point in the chart
             * |----------------------------|
             * |                            |
             * |    y  |   |   |            |
             * |    .  |   |   |            |
             * |    .  | * |   |            | <--- P(x,y) : P(2,3)
             * |    .  |   | * |            |
             * |    .  |   |   |            |
             * |    . . . . . . . .x        |
             * |                            |
             * |----------------------------|
             */
            // to have a greater area to consume a mouseOver we draw a rectangle - so feel free to change this
            // when you want to have a bigger area of mouseSensitive
            blanket.push(self.rect(x - 20, y - 20, 40, 40).attr({stroke: "none", fill: "#fff", opacity: 0}));
            var rect = blanket[blanket.length - 1];

            // show the popUp if the layout says yes
            if (showPopup) {
                (function (x, y, data, dot) {
                    var wholeWidth = chartWidth;
                    rect.hover(
                            // callback for hover-in
                            function () {
                                var direction = 'top'; // default
                                if (y < 40) {
                                    // if we are at the very top, we open the popup to bottom
                                    direction = 'bottom';
                                }
                                if (x < 40) {
                                    // if we are on the left side of the canvas, we open the popup to the right (this means setting direction to start to 'left')
                                    direction = direction + '-left';
                                } else if (x > (wholeWidth - 40)) {
                                    // if we are on the right side of the canvas, we open the popup to the right (this means setting direction to start to 'right')
                                    direction = direction + '-right';
                                }
                                this.popUpLabel = self.text(0, 0, data.label).attr(popupTextFill).attr(popUpFont);
                                this.popUp = self.popup(x, y, this.popUpLabel, direction).attr({fill: popUpBackground, stroke: popUpBorderColor, "stroke-width": 2, "fill-opacity": .7});
                                // set the dot's to a higher radius to blow them up
                                dot.attr("r", 6);
                                is_label_visible = true;
                            }
                            ,
                            // callback for hover-out
                            function () {
                                // hide Label and PopUp
                                this.popUpLabel.hide();
                                this.popUp.hide();
                                // reset the radius
                                dot.attr("r", 4);
                            }

                    );
                })(x, y, pointArray[i], dot);
            } // Eon of popUp-Section

            // call callback for click-Events
            (function(data, dot) {
                rect.click(function () {
                    callback.call(data);
                });
            })(pointArray[i], dot);
        }
        // After all we draw a path from the lastpoint to the lastpoint - sounds silly but we have to do this :-)
        // The last Point in the Array isn't processed in the iteration above - we don't have a point after this, so
        // it would make no sense to calculate a smooth line here - just stop at the end
        if (interpolation != 'none') pathArray = pathArray.concat([x, y, x, y]);
        backGroundPathArray = backGroundPathArray.concat([x, y, x, y, "L", x, chartHeight + yOffset, "z"]);

        // now we have the whole path in the pathArray - so lets set this as attribute to the path
        path.attr({path: pathArray});
        if (fillChart) {
            backGroundPanelPath.attr({path: backGroundPathArray});
        }
        blanket.toFront();

        return self;

    };// End of draw line

    /**
     * Returns all values in one array
     * g.bar will use this to compute the maximum
     * @param barChartModel
     */
    Raphael.fn.exx.getAllValues = function(barChartModel) {
        var returnArray = new Array();
        for (var i = 0; i < barChartModel.barValues.length; i++) {
            for (var j = 0; j < barChartModel.barValues[i].length; j++) {
                if (barChartModel.barValues[i][j]) {
                    returnArray.push(barChartModel.barValues[i][j].value);
                }
            }
        }
        return returnArray;
    }; // End of getAllValues

    /**
     * Returns all numerical-Values from one specific Bar-Array
     * @param barChartModel
     * @param position
     */
    Raphael.fn.exx.getSpecifiedBarValues = function(barChartModel, position) {
        var returnArray = new Array();
        for (var i = 0; i < barChartModel.barValues[position].length; i++) {
            if (barChartModel.barValues[position][i]) {
                returnArray.push(barChartModel.barValues[position][i].value);
            } else {
                returnArray.push(0);
            }
        }
        return returnArray;
    }; // End of getSpecifiedBarValues


})
        ();
/**
 * Raphael-Plugin to draw a lineChart
 * Inspired from: http://raphaeljs.com/analytics.html
 *
 * You have to make sure, that the following scripts are already loaded:
 * <code>exx.raphael.js - Version 1.0</code>
 * You might use a higher Version of these files, but without any warranty!
 *
 * @author Ralf Enderle
 */

/**
 * Will draw a lineChart
 * @param lineChartModel - exxcellent.model.LineChartModel
 * @param lineChartLayout - exxcellent.model.LineChartLayout
 */
Raphael.fn.exx.linechart = function(lineChartModel, lineChartLayout, axisModel, callback) {
    var xOffset = 30;
    var yOffset = 10;
    // the master contains everything
    //var master = this.set();
    // first of all we draw the grid, if it is configured
    if (lineChartLayout.isDrawGrid()) {
        this.exx.drawGrid(xOffset, yOffset, lineChartLayout, axisModel);
    }

    var pointArray = [];
    for (var i = 0; i < lineChartModel.points.length; i++) {
        var point = new Object();
        point.x = lineChartModel.points[i].xValue;
        point.y = lineChartModel.points[i].yValue;
        point.label = lineChartModel.points[i].label;
        point.identifier = lineChartModel.points[i].identifier;
        pointArray = pointArray.concat(point);
    }

    var line = this.exx.drawLine(xOffset, yOffset, pointArray, lineChartLayout, callback);

    //return master;
};

/**
 * BarChart Version 1.0
 * Used to draw fancy BarCharts as an Echo-Component with the help
 * of raphael and the eXXcellent Addon-Library 'exx.raphael'
 * See 'http://raphaeljs.com/' for further information
 * (This component was inspired from: http://g.raphaeljs.com/barchart2.html)
 *
 * @author Ralf Enderle <r.enderle@exxcellent.de>
 * @version 1.0
 */
exxcellent.BarChart = Core.extend(Echo.Component, {
    $load: function () {
        Echo.ComponentFactory.registerType('exxcellent.BarChart', this);
    },
    $static: {
        // some Layout-Data
        WIDTH: 'width',
        HEIGHT: 'height',
        BACKGROUND: 'background',
        // FOREGROUND and FONT can not be set on this component - it makes no sence at this time... maybe we will find some use for them later on
        //        FOREGROUND: 'foreground',
        //        FONT: 'font',
        XGAP: 'xgap',
        YGAP: 'ygap',
        BAR_ALIGNMENT: 'barAlignment',
        HEAD_TYPE: 'headType',
        STACKED: 'stacked',

        SHOW_POPUP: 'showPopup',
        POPUP_BACKGROUND: 'popupBackground',
        POPUP_BORDER_COLOR: 'popupBorderColor',
        POPUP_FOREGROUND: 'popupForeground',
        POPUP_FONT: 'popupFont',

        SHOW_TOOLTIP: 'showTooltip',
        AUTO_ADJUST_POPUP: 'autoAdjustPopup',

        // - comes from JSON
        BAR_CHART_MODEL: 'barChartModel',

        // Action-data
        BAR_SELECTION: 'barSelection'
    },
    componentType: 'exxcellent.BarChart',
    doSelectBar: function (barIdentifier) {
        // Notify table row select listeners.
        this.fireEvent({
            type: exxcellent.BarChart.BAR_SELECTION,
            source: this,
            data: barIdentifier
        });
    }

});

// some dataObjects for BarChart:
// -----------------------------

/**
 * The data object for the PieModel.
 * The only thing you HAVE to specify is 'sectors'
 */
exxcellent.model.BarChartModel = Core.extend({

    // The bars in this barChart
    // CAUTION! It's an array of arrays containing bars
    // e.g. [[bar1, bar2],[bar3, bar4]]
    barValues: null,

    $construct: function (barValues) {
        this.barValues = barValues;
    },

    /** Return the string representation of this PieModel. */
    toString: function () {
        return 'I am a BAR-Chart';
    }
});

/**
 * The data object for a Bar
 */
exxcellent.model.Bar = Core.extend({
    value: null,
    identifier: null,
    label: '',
    color: null,

    $construct: function (value, label, identifier, color) {
        this.value = value;
        this.label = label;
        this.identifier = identifier;
        this.color = color;
    },

    /** Return the string representation of this Bar */
    toString: function () {
        return 'Label:' + this.label + ' value:' + this.value + ' color:' + this.color + ' identifier:' + this.identifier;
    }
});

/**
 * LayoutObject for a barChart
 */
exxcellent.model.BarChartLayout = Core.extend({
    // vertical: |__
    //           |__
    //
    // horizontal: | |
    //             |_|_|
    barAlignment: 'vertical',
    // Visual type of the bar-Head
    //         _          _         _         _
    // square: |_| soft : |_] round |_) sharp |_>
    headType: 'square',
    // should the different values be stacked
    stacked: false,
    // show the PopUp?
    showPopup: true,
    // styling of the popup
    popupBackground: '#000',
    popupBorderColor: '#666',
    popupForeground: '#fff',
    popupFont: null,
    // wanna have some Tooltips
    showTooltip: false,
    // should we try to autoAdjust the PopUp?
    autoAdjustPopup: false,

    width: 100,
    height: 100,

    xgap: 1,
    ygap: 1


});

/**
 * Sync.BarChart
 *
 * BarChartSync Version 1.0
 * Component rendering peer: Sync.BarChart.js
 * This sync renders a BarChart to the DOM.
 *
 * @author Ralf Enderle <r.enderle@exxcellent.de>
 * @version 1.0
 */
exxcellent.BarChartSync = Core.extend(Echo.Render.ComponentSync, {
    $load: function () {
        Echo.Render.registerPeer("exxcellent.BarChart", this);
    },

    $static: {
        // nothing yet
    },
    _div: null,
    _raphael: null,

    /**
     * Add the containerDiv of the bar to the DOM
     * @param update
     * @param parentElement
     */
    renderAdd: function (update, parentElement) {
        // we only need to create the holder' div for raphael - the rest will be done in renderDisplay
        this._div = document.createElement("div");

        // if there is a background defined
        var background = this.component.render(exxcellent.BarChart.BACKGROUND);
        if (background) {
            this._div.style.background = background;
        }

        parentElement.appendChild(this._div);
    },
    /**
     * Render the bar itself to the containerDiv
     */
    renderDisplay: function () {
        var self = this; // it's always good to know who you are in JS :-)
        if (this._raphael) {
            // if we have already a raphael, we do nothing att all - it's just a simple refresh
            return;
        }

        // some helperVars
        var barChartLayout = this._getBarChartLayout();
        var barChartModel = this._getBarChartModel();

        // Instead of throwing an error that something is undefined, we just show nothing
        if (!barChartModel) {
            return;
        }

        // we define the raphael
        this._raphael = Raphael(this._div, barChartLayout.width, barChartLayout.height);
        // a local pointer to raphael - we will pass this to the callbacks
        var raphael_self = this._raphael;
        // an now let's start raphael drawing the barChart

        // we decide between vertical and horizontal
        // Maybe we could use some JS-Voodoo to have just on call with +-h :-) - but it seems to work
        if (barChartLayout.barAlignment == 'horizontal') {
            this._raphael.g.hbarchart(
                barChartLayout.xgap, // x-gap
                barChartLayout.ygap, // y-gap
                barChartLayout.width, // width
                barChartLayout.height, // height
                null, // original 'values' : Changed the behavior tu use this in Echo3 - the model is transported to simile via the attribute 'barChartModel'
                /*options*/
                /**/{
                    /*->*/stacked: barChartLayout.stacked, // isStacked
                    /*->*/type: barChartLayout.headType, // headType
                    /*->*/vgutter: 0, // the empty-spacing vertically
                    /*->*/showTooltip: barChartLayout.showTooltip
                    /**/},
                barChartModel // the barModel (array of array of exxcellent.model.Bar
            ).hover(// MouseHovering:
                    this._fin(barChartLayout, raphael_self), // MouseIn
                    this._fout(barChartLayout, raphael_self) // MouseOut
                ).click(this._click(this, raphael_self))// Click-Handler
            ; // -> that's it :-)
        } else if (barChartLayout.barAlignment == 'vertical') {
            // just some little difference, we call barchart instead of hbarchart
            this._raphael.g.barchart(
                barChartLayout.xgap, // x-gap
                barChartLayout.ygap, // y-gap
                barChartLayout.width, // width
                barChartLayout.height, // height
                null, // original 'values' : Changed the behavior tu use this in Echo3 - the model is transported to simile via the attribute 'barChartModel'
                /*options*/
                /**/{
                    /*->*/stacked: barChartLayout.stacked, // isStacked
                    /*->*/type: barChartLayout.headType, // headType
                    /*->*/vgutter: 0, // the empty-spacing vertically
                    /*->*/showTooltip: barChartLayout.showTooltip
                    /**/},
                barChartModel // the barModel (array of array of exxcellent.model.Bar
            ).hover(// MouseHovering:
                    this._fin(barChartLayout, raphael_self), // MouseIn
                    this._fout(barChartLayout, raphael_self) // MouseOut
                ).click(this._click(this, raphael_self))// Click-Handler
            ; // -> that's it :-)

        }
    },

    /**
     * Called when the component is destroyed!
     * We clean all allocated data
     * @param update
     */
    renderDispose: function (update) {
        // setting all globals to null - we don't want them to live forever ;-)
        this._div = null;
        this._raphael = null;
    },
    /**
     * Called when an update happens.
     *
     * @param update
     */
    renderUpdate: function (update) {
        // Brut-force - just create everything new
        // we could think about of some ajax-feature, but there is no need so far
        var element = this._div;
        this._raphael = null; // we set the Raphael to null to force a redraw
        var containerElement = element.parentNode;
        Echo.Render.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return true;
    },

    // --- own methods ---
    // -------------------

    /**
     * Callback for MouseIn
     * @param raphael
     */
    _fin: function (barChartLayout, raphael) {
        return function () {
            if (barChartLayout.showPopup) {
                var direction = 'top';
                if (barChartLayout.autoAdjustPopup) {
                    // damn IE vs. FF... IE defines canvas.clientWidth and FF paper.width... :-(
                    var widthToTest = (this.paper.canvas.clientWidth && this.paper.canvas.clientWidth !== 0) ? this.paper.canvas.clientWidth : this.paper.width;
                    var heightToTest = (this.paper.canvas.clientHeight && this.paper.canvas.clientHeight !== 0) ? this.paper.canvas.clientHeight : this.paper.height;
                    // we try to adjust the PopUp
                    if (this.bar.x > widthToTest - 50 && this.bar.y > heightToTest - 50) {
                        direction = 'top-right';
                    } else if (this.bar.x < 50 && this.bar.y > heightToTest - 50) {
                        direction = 'top-left';
                    } else if (this.bar.x > widthToTest - 50) {
                        direction = 'bottom-right';
                    } else if (this.bar.x < 50) {
                        direction = 'bottom-left';
                    } else if (this.bar.y < 50) {
                        direction = 'bottom';
                    }
                }
                var popupTextFill = {fill: barChartLayout.popupForeground};
                var popUpFont = barChartLayout.popupFont;
                this.popUpLabel = raphael.text(0, 0, this.bar.Bar.label || "0").attr(popupTextFill).attr(popUpFont);
                this.popUpBubble = raphael.popup(this.bar.x, this.bar.y, this.popUpLabel, direction).attr({fill: barChartLayout.popupBackground, stroke: barChartLayout.popupBorderColor, "stroke-width": 2, "fill-opacity": 0.7});
            }
        };

    },

    /**
     * Callback for MouseOut
     * @param raphael
     */
    _fout: function (barChartLayout, raphael) {
        // we certainly don't need the variable raphael... bu who knows what's later on
        return function () {
            if (barChartLayout.showPopup) {
                this.popUpLabel.animate({opacity: 0}, 300, function () {
                    this.remove();
                });
                this.popUpBubble.animate({opacity: 0}, 300, function () {
                    this.remove();
                });
            }
        };
    },

    /**
     * Callback for clicking a bar
     * @param self
     * @param raphael
     */
    _click: function (self, raphael) {
        // we certainly don't need the variable raphael... bu who knows what's later on
        return function () {
            // throw the action 'doSelectBar' with the identifier
            self.component.doSelectBar(this.bar.Bar.identifier);
        };

    },

    /**
     * Returns the BarChartLayout - this Objects helps to deal with Layout
     * @see exxcellent.model.BarChartLayout for further details
     */
    _getBarChartLayout: function () {
        // We try to get all values defined by the user. For Fallback there are defaults defined where suitable
        var barChartLayout = new exxcellent.model.BarChartLayout();
        barChartLayout.width = this.component.render(exxcellent.BarChart.WIDTH) || 100;
        barChartLayout.height = this.component.render(exxcellent.BarChart.HEIGHT) || 100;
        barChartLayout.xgap = this.component.render(exxcellent.BarChart.XGAP) || 1;
        barChartLayout.ygap = this.component.render(exxcellent.BarChart.YGAP) || 1;
        barChartLayout.barAlignment = this.component.render(exxcellent.BarChart.BAR_ALIGNMENT) || 'vertical';
        barChartLayout.headType = this.component.render(exxcellent.BarChart.HEAD_TYPE) || 'square';
        barChartLayout.stacked = this.component.render(exxcellent.BarChart.STACKED) || false;
        barChartLayout.showPopup = this.component.render(exxcellent.BarChart.SHOW_POPUP) || false;
        barChartLayout.popupBackground = this.component.render(exxcellent.BarChart.POPUP_BACKGROUND) || '#000';
        barChartLayout.popupBorderColor = this.component.render(exxcellent.BarChart.POPUP_BORDER_COLOR) || '#666';
        barChartLayout.popupForeground = this.component.render(exxcellent.BarChart.POPUP_FOREGROUND) || '#fff';
        barChartLayout.popupFont = this._renderFont(this.component.render(exxcellent.BarChart.POPUP_FONT)) || {font: '10px Helvetica, Arial'};
        barChartLayout.showTooltip = this.component.render(exxcellent.BarChart.SHOW_TOOLTIP) || false;
        barChartLayout.autoAdjustPopup = this.component.render(exxcellent.BarChart.AUTO_ADJUST_POPUP) || false;
        return barChartLayout;
    },

    /**
     * Get the BarChart-Model.
     * In case of a JSON-Object we parse it to create the exxcellent.model.BarChartModel
     */
    _getBarChartModel: function () {
        var value = this.component.render(exxcellent.BarChart.BAR_CHART_MODEL);
        if (value instanceof exxcellent.model.BarChartModel) {
            return value;
        } else if (value) {
            return this._fromJsonString(value).barChartModel;
        }
    },

    /**
     * Method to parse a JSON string into an object.
     * @see "http://www.json.org/js.html"
     * @param {} json the string to be transformed into an object
     * @return {} the object
     */
    _fromJsonString: function (jsonStr) {
        return JSON.parse(jsonStr);
    },

    /**
     * Method to convert an object to a json string.
     * @see "http://www.json.org/js.html"
     * @param {} object the object to be transformed into string
     * @return {} the json string
     */
    _toJsonString: function (object) {
        return JSON.stringify(object);
    },

    /**
     * Renders the font to be used by the PieChart component.
     * @param font {Echo.Sync.Font} the font to render as notifier compatible font
     * @return the raphael compatible font
     */
    _renderFont: function (font) {
        if (!font) {
            return null;
        }
        var fontByEcho = {
            style: {}
        };
        Echo.Sync.Font.render(font, fontByEcho);
        var echoStyle = fontByEcho.style;

        return {
            'font': echoStyle.fontSize + ' ' + echoStyle.fontFamily,
            'font-family': echoStyle.fontFamily,
            'font-size': echoStyle.fontSize,
            'font-style': echoStyle.fontStyle
        };

    }
});
/**
 * Column alike component: a layout container which renders its content in a single
 * vertical column of cells. May contain zero or more child components. Does not
 * support pane components as children.
 *
 * @sp {#Border} border the border displayed around the entire column
 * @sp {#Extent} cellSpacing the extent margin between cells of the column
 * @sp {#Insets} insets the inset margin between the column border and its cells
 *
 * @ldp {#Alignment} alignment the alignment of the child component within its
 *      cell
 * @ldp {#Color} background the background of the child component's cell
 * @ldp {#FillImage} backrgoundImage the background image of the child
 *      component's cell
 * @ldp {#Extent} height the height of the child component's cell
 * @ldp {#Insets} insets the insets margin of the child component's cell (this
 *      inset is added to any inset set on the container component)
 */
exxcellent.Block = Core.extend(Echo.Component, {

    $load: function () {
        Echo.ComponentFactory.registerType("exxcellent.Block", this);
    },

    /** @see Echo.Component#componentType */
    componentType: "exxcellent.Block"
});

/**
 * Component rendering peer: Block (Column)
 */
exxcellent.BlockSync = Core.extend(Echo.Sync.ArrayContainer, {

    $load: function () {
        Echo.Render.registerPeer("exxcellent.Block", this);
    },

    /** @see Echo.Render.ComponentSync#cellElementNodeName */
    cellElementNodeName: "div",

    /** @see Echo.Sync.ArrayContainer#prevFocusKey */
    prevFocusKey: 38,

    /** @see Echo.Sync.ArrayContainer#prevFocusFlag */
    prevFocusFlag: Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_UP,

    /** @see Echo.Sync.ArrayContainer#nextFocusKey */
    nextFocusKey: 40,

    /** @see Echo.Sync.ArrayContainer#nextFocusFlag */
    nextFocusFlag: Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_DOWN,

    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function (update, parentElement) {
        this.element = this.containerElement = document.createElement("div");
        this.element.id = this.component.renderId;
        this.element.style.outlineStyle = "none";
        this.element.tabIndex = "-1";

        Echo.Sync.renderComponentDefaults(this.component, this.element);
        Echo.Sync.Border.render(this.component.render("border"), this.element);
        Echo.Sync.Insets.render(this.component.render("insets"), this.element, "padding");

        this.cellSpacing = Echo.Sync.Extent.toPixels(this.component.render("cellSpacing"), false);
        if (this.cellSpacing) {
            this.spacingPrototype = document.createElement("div");
            this.spacingPrototype.style.height = this.cellSpacing + "px";
            this.spacingPrototype.style.fontSize = "1px";
            this.spacingPrototype.style.lineHeight = "0";
        }

        this.renderAddChildren(update);

        parentElement.appendChild(this.element);
    },

    /** @see Echo.Sync.ArrayContainer#renderChildLayoutData */
    renderChildLayoutData: function (child, cellElement) {
        var layoutData = child.render("layoutData");
        if (layoutData) {
            Echo.Sync.Color.render(layoutData.background, cellElement, "backgroundColor");
            Echo.Sync.FillImage.render(layoutData.backgroundImage, cellElement);
            Echo.Sync.Insets.render(layoutData.insets, cellElement, "padding");
            Echo.Sync.Alignment.render(layoutData.alignment, cellElement, true, this.component);

            if (layoutData.marginLeft) {
                cellElement.style.marginLeft = layoutData.marginLeft;
            }
            if (layoutData.marginRight) {
                cellElement.style.marginRight = layoutData.marginRight;
            }
            if (layoutData.marginTop) {
                cellElement.style.marginTop = layoutData.marginTop;
            }
            if (layoutData.marginBottom) {
                cellElement.style.marginBottom = layoutData.marginBottom;
            }
            if (layoutData.width) {
                cellElement.style.width = Echo.Sync.Extent.toPixels(layoutData.width, false) + "px";
            }
            if (layoutData.height) {
                cellElement.style.height = Echo.Sync.Extent.toPixels(layoutData.height, false) + "px";
            }
            if (layoutData.floating) {
                // all major browsers use float? no cssFloat, since float became a reserved word in js.
                cellElement.style.cssFloat = layoutData.floating;
                // IE wants its own float var name
                cellElement.style.styleFloat = layoutData.floating;
            }
        }
    }
});
/**
 * Component implementation for a DatePicker.
 */
exxcellent.DatePicker = Core.extend(Echo.Component, {

    $load: function () {
        Echo.ComponentFactory.registerType("exxcellent.DatePicker", this);
    },

    /**
     * Properties defined for this component.
     */
    $static: {
        /* DatePicker properties. */
        TRIGGER_EVENT: "triggerEvent",
        NUMBER_OF_CALENDARS: "numberOfCalendars",
        DEFAULT_DATE: "defaultDate",
        LOCALE_MODEL: "localeModel",
        VIEW_MODE: "viewMode",
        SELECTION_MODE: "selectionMode",
        HIDE_ON_SELECT: "hideOnSelect",
        FLAT_MODE: "flatMode",
        POSITION: "position",
        CSS: "css",
        IMG_DATEPICKER_T: "DATEPICKER_T_IMG",
        IMG_DATEPICKER_B: "DATEPICKER_B_IMG",
        IMG_DATEPICKER_L: "DATEPICKER_L_IMG",
        IMG_DATEPICKER_R: "DATEPICKER_R_IMG",
        IMG_DATEPICKER_W: "DATEPICKER_W_IMG",//TL
        IMG_DATEPICKER_X: "DATEPICKER_X_IMG",//TR
        IMG_DATEPICKER_Y: "DATEPICKER_Y_IMG",//BL
        IMG_DATEPICKER_Z: "DATEPICKER_Z_IMG",//BR
        REGEX: "regex",
        /* Textfield properties. */
        TEXT: "text",
        MAX_LENGTH: "maximumLength",
        WIDTH: "width",
        EDITABLE: "editable",
        BORDER: "border",
        FOREGROUND: "foreground",
        DISABLED_FOREGROUND: "disabledForeground",
        BACKGROUND: "background",
        DISABLED_BACKGROUND: "disabledBackground",
        DISABLED_BORDER: "disabledBorder",
        FONT: "font",
        DISABLED_FONT: "disabledFont",
        BACKGROUND_IMG: "backgroundImage",
        DISABLED_BACKGROUND_IMG: "disabledBackgroundImage",
        ALIGNMENT: "alignment",
        INSETS: "insets",
        HEIGHT: "height",
        TOOLTIP_TEXT: "toolTipText"
    },

    componentType: "exxcellent.DatePicker",
    focusable: true,

    /**
     * Programmatically performs a text component action. The user hits Enter on the input textfield.
     */
    doAction: function () {
        this.fireEvent({
            type: "action",
            source: this,
            actionCommand: this.get("actionCommand")});
    }
});

/** The locale model object describes regional settings. */
exxcellent.model.LocaleModel = Core.extend({
    prevText: null,
    nextText: null,
    weekText: null,
    monthNames: null,
    monthNamesShort: null,
    dayNames: null,
    dayNamesShort: null,
    dayNamesMin: null,
    dateFormat: null,
    firstDay: null,

    $construct: function (prevText, nextText, weekText, monthNames, monthNamesShort, dayNames, dayNamesShort, dayNamesMin, dateFormat, firstDay) {
        this.prevText = prevText;
        this.nextText = nextText;
        this.weekText = weekText;
        this.monthNames = monthNames;
        this.monthNamesShort = monthNamesShort;
        this.dayNames = dayNames;
        this.dayNamesShort = dayNamesShort;
        this.dayNamesMin = dayNamesMin;
        this.dateFormat = dateFormat;
        this.firstDay = firstDay;
    },

    /** Return the string representation of this model. */
    toString: function () {
        return this.monthNames;
    }
});
/**
 * Component rendering peer: DatePicker.
 * <br/>This component consists of an input field and a date selection component, that hides
 * until the input field is clicked. The whole input field is based (copied) on the
 * Sync.TextComponent.js of echo3. It inherits all features and bugs. It was not inherited directly because
 * the focus management and some callbacks are different and would require changing the TextComponent itself.
 * <p>
 * Furthermore this component only describes the rendering of the inputfield and delegates all events to
 * the DatePicker.
 * </p>
 * Features:
 * <ul>
 * <li>input field is a copy of the a echo3 Textfield</li>
 * <li>DatePicker has i18n capabilities via a separate locale model</li>
 * <li>Supports SimpleDateFormat as used in JAVA</li>
 * <li>Supports selecting a single date</li>
 * <li>Supports showing multiple calendars</li>
 * <li>Restricts input field to allow only the values defined in the date format (regular expression)</li>
 * <li>NOT YET IMPLEMENTED: select date ranges (native support is available)</li>
 * <li>NOT YET IMPLEMENTED: select multiple dates (native support is available)</li>
 * </ul>
 * @author oliver pehnke <o.pehnke@exxcellent.de>
 */
exxcellent.DatePickerSync = Core.extend(Echo.Render.ComponentSync, {

    $load: function () {
        Echo.Render.registerPeer("exxcellent.DatePicker", this);
        Core.Web.Event.debugListenerCount = true;
    },

    $static: {

        /**
         * Array containing properties that may be updated without full re-render.
         * @type Array
         */
        _supportedPartialProperties: ["text", "editable"]
    },

    /** input field of the DatePicker. */
    _input: null,
    /** the jquery datePicker popup widget. */
    _datepicker: null,
    _renderRequired: null,

    /**
     * Flag indicating whether width has been set as a percentage.
     * @type Boolean
     */
    percentWidth: false,

    /**
     * The last processed value of the text field, i.e., the last value of the input field
     * that was stored in the component hierarchy.  When input is provided while restrictions
     * are in place, this value is not updated.
     */
    _lastProcessedValue: null,

    /**
     * Actual focus state of component, based on received DOM focus/blur events.
     * @type Boolean
     */
    _focused: false,

    /**
     * Describes how a component is initially built.
     */
    renderAdd: function (update, parentElement) {
        if (window.console && window.console.log) {
            window.console.log('Adding div (renderAdd).');
        }
        /* the input field for the date. */
        this._input = document.createElement("input");
        this._input.id = this.component.renderId;
        if (!this.component.render(exxcellent.DatePicker.EDITABLE, true)) {
            this._input.readOnly = true;
        }
        this._input.type = "text";
        var maximumLength = this.component.render(exxcellent.DatePicker.MAX_LENGTH, -1);
        if (maximumLength >= 0) {
            this._input.maxLength = maximumLength;
        }
        this._renderStyle(this._input);

        // add event listener to inputField
        Core.Web.Event.add(this._input, "focus", Core.method(this, this._processFocus), false);
        Core.Web.Event.add(this._input, "blur", Core.method(this, this._processBlur), false);
        Core.Web.Event.add(this._input, "keyup", Core.method(this, this._processKeyPresses), false);

        if (this.component.get(exxcellent.DatePicker.TEXT)) {
            this._input.value = this.component.get(exxcellent.DatePicker.TEXT);
        }

        /* add the modified stylesheet. */
        if (jQuery("#datepickerCss").length === 0) {
            var stylesheet = this._createStylesheet();
            jQuery("head").append("<style type=\"text/css\" id=\"datepickerCss\">" + stylesheet + "</style>");
        }
        this.renderAddToParent(parentElement);
    },

    /**
     * Describes how the component renders itself.<br/>
     * This method is also triggered if the renderUpdate decided to partially render the component!
     */
    renderDisplay: function () {
        if (window.console && window.console.log) {
            window.console.log('Displaying DatePicker (renderDisplay()).');
        }

        var width = this.component.render(exxcellent.DatePicker.WIDTH);
        if (width && Echo.Sync.Extent.isPercent(width) && this._input.parentNode.offsetWidth) {
            // If width is a percentage, reduce rendered percent width based on measured container size and border width,
            // such that border pixels will not make the component wider than specified percentage.
            var border = this.component.render(exxcellent.DatePicker.BORDER);
            var borderSize = border ?
                (Echo.Sync.Border.getPixelSize(border, "left") + Echo.Sync.Border.getPixelSize(border, "right")) : 4;
            var insets = this.component.render(exxcellent.DatePicker.INSETS);
            if (insets) {
                var insetsPx = Echo.Sync.Insets.toPixels(insets);
                borderSize += insetsPx.left + insetsPx.right;
            }

            // Perform fairly ridiculous browser-specific adjustments.
            if (Core.Web.Env.ENGINE_MSHTML) {
                // Add additional 1px for IE.
                borderSize += 1;
                // Add default windows scroll bar width to border size for Internet Explorer browsers.
                if (this.container) {
                    this.container.style.width = this._adjustPercentWidth(parseInt(width, 10), 0,
                        this._input.parentNode.offsetWidth) + "%";
                    /*this.container.style.width = this._adjustPercentWidth(100, Core.Web.Measure.SCROLL_WIDTH,/ 
                     this._input.parentNode.offsetWidth) + "%";
                     */
                } else {
                    /*borderSize += Core.Web.Measure.SCROLL_WIDTH;*/
                }
            } else if (Core.Web.Env.BROWSER_SAFARI && this._input.nodeName.toLowerCase() == "input") {
                // Add additional 1px to INPUT elements for Safari.
                borderSize += 1;
            } else if (Core.Web.Env.ENGINE_PRESTO) {
                // Add additional 1px to all for Opera.
                borderSize += 1;
            }

            this._input.style.width = this._adjustPercentWidth(parseInt(width, 10), borderSize,
                this._input.parentNode.offsetWidth) + "%";
        }
        if (!this._datepicker) {
            if (window.console && window.console.log) {
                window.console.log('Creating new DatePicker (renderDisplay()).');
            }
            var options = this._renderOptions();
            this._datepicker = $(this._input).datePicker(options);
        }
    },

    /**
     * Describes how a component is updated, e.g. destroyed and build again. The
     * DatePicker supports partially updates for text and editable property.
     */
    renderUpdate: function (update) {
        var fullRender = !Core.Arrays.containsAll(exxcellent.DatePickerSync._supportedPartialProperties,
            update.getUpdatedPropertyNames(), true);

        if (fullRender) {
            var element = this.container ? this.container : this._input;
            var containerElement = element.parentNode;
            this.renderDispose(update);
            containerElement.removeChild(element);
            this.renderAdd(update, containerElement);
        } else {
            if (update.hasUpdatedProperties()) {
                if (window.console && window.console.log) {
                    window.console.log('Rendering update.');
                }
                var textUpdate = update.getUpdatedProperty("text");
                if (textUpdate) {
                    var newValue = !textUpdate.newValue ? "" : textUpdate.newValue;
                    if (newValue != this._lastProcessedValue) {
                        this._input.value = newValue;
                        this._lastProcessedValue = newValue;
                    }
                }
                var editableUpdate = update.getUpdatedProperty("editable");
                if (editableUpdate) {
                    this._input.readOnly = !editableUpdate.newValue;
                    if (editableUpdate.newValue) {
                        $(this._input).removeClass("datepickerDisabled");
                    } else {
                        $(this._input).addClass("datepickerDisabled");
                    }
                }
            }
        }
        return false; // Child elements not supported: safe to return false.
    },

    /**
     * Describes how the component is destroyed.
     */
    renderDispose: function (update) {
        // These cleanup things are CRUCICAL to avoid DRASTIC memory leaks.
        //
        // Remove attached keylisteners from the DIV
        Core.Web.Event.removeAll(this._input);

        if (this._datepicker) {
            this._datepicker.pickerHide();
            this._datepicker.pickerDestroy();
        }

        this._focused = false;
        this._input = null;
        this._datepicker = null;
    },

    /**
     * Adds the input element to its parent in the DOM.
     * Wraps the element in a special container DIV if necessary to appease Internet Explorer's various text field/area bugs,
     * including percent-based text areas inducing scroll bars and the IE6 percentage width "growing" text area bug.
     *
     * @param parentElement the parent element
     */
    renderAddToParent: function (parentElement) {
        if (Core.Web.Env.BROWSER_INTERNET_EXPLORER && this.percentWidth) {
            this.container = document.createElement("div");
            this.container.appendChild(this._input);
            parentElement.appendChild(this.container);
        } else {
            parentElement.appendChild(this._input);
        }
    },

    /**
     * Reduces a percentage width by a number of pixels based on the container size.
     *
     * @param {Number} percentValue the percent span
     * @param {Number} reducePixels the number of pixels by which the percent span should be reduced
     * @param {Number} containerPixels the size of the container element
     */
    _adjustPercentWidth: function (percentValue, reducePixels, containerPixels) {
        var value = (100 - (100 * reducePixels / containerPixels)) * percentValue / 100;
        return value > 0 ? value : 0;
    },

    /**
     * Renders style information: colors, borders, font, insets, etc.
     * Sets percentWidth flag.
     */
    _renderStyle: function () {
        if (this.component.isRenderEnabled()) {
            Echo.Sync.renderComponentDefaults(this.component, this._input);
            Echo.Sync.Border.render(this.component.render(exxcellent.DatePicker.BORDER), this._input);
            Echo.Sync.FillImage.render(this.component.render(exxcellent.DatePicker.BACKGROUND_IMG), this._input);
        } else {
            Echo.Sync.LayoutDirection.render(this.component.getLayoutDirection(), this._input);
            Echo.Sync.Color.render(Echo.Sync.getEffectProperty(this.component, exxcellent.DatePicker.FOREGROUND, exxcellent.DatePicker.DISABLED_FOREGROUND, true),
                this._input, "color");
            Echo.Sync.Color.render(Echo.Sync.getEffectProperty(this.component, exxcellent.DatePicker.BACKGROUND, exxcellent.DatePicker.DISABLED_BACKGROUND, true),
                this._input, "backgroundColor");
            Echo.Sync.Border.render(Echo.Sync.getEffectProperty(this.component, exxcellent.DatePicker.BORDER, exxcellent.DatePicker.DISABLED_BORDER, true),
                this._input);
            Echo.Sync.Font.render(Echo.Sync.getEffectProperty(this.component, exxcellent.DatePicker.FONT, exxcellent.DatePicker.DISABLED_FONT, true),
                this._input);
            Echo.Sync.FillImage.render(Echo.Sync.getEffectProperty(this.component,
                exxcellent.DatePicker.BACKGROUND_IMG, exxcellent.DatePicker.DISABLED_BACKGROUND_IMG, true), this._input);
        }
        Echo.Sync.Alignment.render(this.component.render(exxcellent.DatePicker.ALIGNMENT), this._input, false, null);
        Echo.Sync.Insets.render(this.component.render(exxcellent.DatePicker.INSETS), this._input, "padding");
        var width = this.component.render(exxcellent.DatePicker.WIDTH);
        this.percentWidth = Echo.Sync.Extent.isPercent(width);
        if (width) {
            if (this.percentWidth) {
                // Set width very small temporarily, renderDisplay will correct.
                this._input.style.width = "5px";
            } else {
                this._input.style.width = Echo.Sync.Extent.toCssValue(width, true);
            }
        }
        var height = this.component.render(exxcellent.DatePicker.HEIGHT);
        if (height) {
            this._input.style.height = Echo.Sync.Extent.toCssValue(height, false);
        }
        var toolTipText = this.component.render(exxcellent.DatePicker.TOOLTIP_TEXT);
        if (toolTipText) {
            this._input.title = toolTipText;
        }
    },

    /**
     * Renders all available options available for the DatePicker.
     * @see http://docs.jquery.com/UI/Datepicker#options
     */
    _renderOptions: function () {
        var localeModel = this._getLocaleModel();
        return Object({
            /* The desired event to trigger the date picker. Default: 'click'*/
            eventName: this.component.render(exxcellent.DatePicker.TRIGGER_EVENT),
            /* Callback function */
            onChange: this._onSelect,
            /* Number of calendars to render inside the date picker. Default 1*/
            calendars: this.component.render(exxcellent.DatePicker.NUMBER_OF_CALENDARS),
            /* HTML inserted to previous links. Default '◀' (UNICODE black left arrow)*/
            prev: localeModel.prevText,
            /* HTML inserted to next links. Default '▶' (UNICODE black right arrow)*/
            next: localeModel.nextText,
            /* The day week start. Default 1 (monday)*/
            start: localeModel.firstDay,
            /* Start view mode. Default 'days': ['days'|'months'|'years']*/
            view: this.component.render(exxcellent.DatePicker.VIEW_MODE),
            /* Date selection mode. Default 'single': ['single'|'multiple'|'range']*/
            mode: this.component.render(exxcellent.DatePicker.SELECTION_MODE),
            /* Whatever if the date picker is appended to the element or triggered by an event. Default false*/
            flat: this.component.render(exxcellent.DatePicker.FLAT_MODE),
            /* The initial date(s):
             * - as String (will be converted to Date object based on the format supplied),
             * - as Date object for single selection,
             * - as Array of Strings for multiple selection,
             * - as Array if Date objects for multiple selection*/
            //date: this._input.value,
            /* Undocumented well used field: should be the same as date? */
            //current: this._input.value,
            /* used for callbacks as THIS reference */
            owner: this,
            /* Date picker's position relative to the trigger element (non flat mode only): ['top'|'left'|'right'|'bottom'] */
            position: this.component.render(exxcellent.DatePicker.POSITION),
            /* Date format. Default 'Y-m-d'*/
            format: localeModel.dateFormat,
            /* If the datePicker is hidden after a date was selected. */
            hideOnSelect: this.component.render(exxcellent.DatePicker.HIDE_ON_SELECT),

            /* the locale hash*/
            locale: {
                days: localeModel.dayNames,
                daysShort: localeModel.dayNamesShort,
                daysMin: localeModel.dayNamesMin,
                months: localeModel.monthNames,
                monthsShort: localeModel.monthNamesShort,
                weekMin: localeModel.weekText
            }
        });
    },

    /**
     * Method to return the localeModel object.
     */
    _getLocaleModel: function () {
        var value = this.component.render(exxcellent.DatePicker.LOCALE_MODEL);
        var localeModel;
        if (value) {
            if (value instanceof exxcellent.model.LocaleModel) {
                localeModel = value;
            } else if (value) {
                localeModel = this._fromJsonString(value).localeModel;
            }
        }
        return localeModel;
    },

    /**
     * Method to parse a JSON string into an object.
     * @see "http://www.json.org/js.html"
     * @param {} json the string to be transformed into an object
     * @return {} the object
     */
    _fromJsonString: function (jsonStr) {
        return JSON.parse(jsonStr);
    },

    /**
     * Method to convert an object to a json string.
     * @see "http://www.json.org/js.html"
     * @param {} object the object to be transformed into string
     * @return {} the json string
     */
    _toJsonString: function (object) {
        return JSON.stringify(object);
    },

    /**
     * Creates a stylesheet with dynamically replaced images.
     * @return css String the stylesheet itself as text
     */
    _createStylesheet: function () {
        var css = this.component.render(exxcellent.DatePicker.CSS);
        if (css) {
            css = css.replace(/DATEPICKER_T/g, this.component.render(exxcellent.DatePicker.IMG_DATEPICKER_T));
            css = css.replace(/DATEPICKER_B/g, this.component.render(exxcellent.DatePicker.IMG_DATEPICKER_B));
            css = css.replace(/DATEPICKER_L/g, this.component.render(exxcellent.DatePicker.IMG_DATEPICKER_L));
            css = css.replace(/DATEPICKER_R/g, this.component.render(exxcellent.DatePicker.IMG_DATEPICKER_R));
            css = css.replace(/DATEPICKER_W/g, this.component.render(exxcellent.DatePicker.IMG_DATEPICKER_W));
            css = css.replace(/DATEPICKER_X/g, this.component.render(exxcellent.DatePicker.IMG_DATEPICKER_X));
            css = css.replace(/DATEPICKER_Y/g, this.component.render(exxcellent.DatePicker.IMG_DATEPICKER_Y));
            css = css.replace(/DATEPICKER_Z/g, this.component.render(exxcellent.DatePicker.IMG_DATEPICKER_Z));
        }
        return css;
    },

    /**
     * Method that is triggered if a date is selected in the DatePicker component popup.
     * 'this' refers to this component.
     * @param {} formatted - the date format
     * @param {} dates - the selected dates
     */
    _onSelect: function (formatted, dates) {
        if (this._debug && window.console && window.console.log) {
            window.console.log('OnSelect: ' + formated + ", " + dates);
        }
        this._input.value = formatted;
        this._storeValue.call(this, null);
    },

    /** Processes the blur event (focus lost).*/
    _processBlur: function (e) {
        if (window.console && window.console.log) {
            window.console.log('_processBlur()');
        }
        // dont set this._focused to true because _storeValue() triggers the renderUpdate
        // that will renderFocus again. This will show up the date picker again...
        this._focused = false;
        return this._storeValue();
    },

    /**
     * Processes all key up events. (keyPress event) hides the DatePicker.
     * @see http://www.quirksmode.org/dom/events/index.html
     */
    _processKeyPresses: function (e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return true;
        }
        // any pressed key will trigger storing the value
        this._storeValue(e);

        //if (this._doFilterValue(e)) {
        // bubble the key event
        if (this._datepicker) {
            this._datepicker.pickerRemoteControl(e);
        }
        return true;
        //} else {
        // do not bubble event further, the key press is prevented.
        //	Core.Web.DOM.preventEventDefault(e);
        //	return false;
        //}
    },

    /**
     * Processes a focus event. Notifies application of focus.
     */
    _processFocus: function (e) {
        if (window.console && window.console.log) {
            window.console.log('_processFocus()');
        }
        this._focused = true;
        if (!this.client || !this.component.isActive()) {
            return true;
        }
        this.client.application.setFocusedComponent(this.component);
    },

    /**  @see Echo.Render.ComponentSync#getFocusFlags */
    getFocusFlags: function () {
        return Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_UP | Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_DOWN;
    },

    /**
     * Processes the focus receive event (focus receive).
     * @see Echo.Render.ComponentSync#renderFocus
     */
    renderFocus: function () {
        if (window.console && window.console.log) {
            window.console.log('renderFocus()');
        }
        Core.Web.DOM.focusElement(this._input);
    },

    /**
     * Event listener to process input after client input restrictions have been cleared.
     */
    _processRestrictionsClear: function () {
        if (!this.client) {
            // Component has been disposed, do nothing.
            return;
        }

        if (!this.client.verifyInput(this.component) || this._input.readOnly) {
            // Client is unwilling to accept input or component has been made read-only:
            // Reset value of text field to text property of component.
            this._input.value = this.component.get("text");
            return;
        }

        // All-clear, store current text value.
        this.component.set("text", this._input.value, true);
    },

    /**
     * Stores the current value of the input field, if the client will allow it.
     * If the client will not allow it, but the component itself is active, registers
     * a restriction listener to be notified when the client is clear of input restrictions
     * to store the value later.
     *
     * @param keyEvent the user keyboard event which triggered the value storage request (optional)
     */
    _storeValue: function (keyEvent) {
        if (window.console && window.console.log) {
            window.console.log('_storeValue(), keyEvent: ' + keyEvent + ', inputValue: ' + this._input.value + ', lastValue: ' + this._lastProcessedValue);
        }

        if (!this.client || !this.component.isActive()) {
            if (keyEvent) {
                // Prevent input.
                Core.Web.DOM.preventEventDefault(keyEvent);
            }
            return;
        }

        if (!this.client.verifyInput(this.component)) {
            // Component is willing to receive input, but client is not ready:  
            // Register listener to be notified when client input restrictions have been removed, 
            // but allow the change to be reflected in the text field temporarily.
            this.client.registerRestrictionListener(this.component, Core.method(this, this._processRestrictionsClear));
            return;
        }

        // Component and client are ready to receive input, set the component property and/or fire action event.
        this.component.set("text", this._input.value, true);
        this._lastProcessedValue = this._input.value;

        /* trigger the action if the user hits ENTER (13) */
        if (keyEvent && 13 == keyEvent.keyCode) {
            this.component.doAction();
        }
    },

    /**
     * The filter function implementation.
     * Inspired from echopoint.RegexTextField (@author Rakesh 2009-03-08)
     * @return <code>true</code> only if the key is allowed, otherwise <code>false</code>
     */
    _doFilterValue: function (event) {
        event = (event) ? event : window.event;
        var charCode = (event.which) ? event.which : event.keyCode;

        if (( charCode <= 31 ) || ( charCode == 37 ) || ( charCode == 39 )) {
            return true;
        }

        // Disable "paste" explicitly
        if (( event.metaKey || event.ctrlKey ) && ( charCode == 118 )) {
            return false;
        }

        var regexString = this.component.render(exxcellent.DatePicker.REGEX);
        if (regexString) {
            var position = this._getCaretPosition();
            var regex = new RegExp(regexString);
            var value = this._input.value.substring(0, position) + String.fromCharCode(charCode) + this._input.value.substring(position);
            return regex.test(value);
        } else {
            // no REGEX defined, so allow everything
            return true;
        }
    },

    /**
     * Return the caret position in the text field component.
     * Inspired from echopoint.RegexTextField (@author Rakesh 2009-03-08)
     */
    _getCaretPosition: function () {
        var position = ( this._input.value ) ? this._input.value.length : 0;

        if (document.selection) {
            // IE
            this._input.focus();
            var selection = document.selection.createRange();
            var length = document.selection.createRange().text.length;
            selection.moveStart('character', -this._input.value.length);
            position = selection.text.length - length;
        } else if (this._input.selectionStart ||
            this._input.selectionStart == '0') {
            // FireFox
            position = this._input.selectionStart;
        }
        return position;
    }
});
/*
 * This file (Sync.Expander.js) is part of the Echolot Project (hereinafter "Echolot").
 * Copyright (C) 2008-2011 eXXcellent Solutions GmbH.
 *
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 */

/**
 * Expander component: A container which has either one or two children. It renders a section
 * line with an optional title at the top of its content. The content can be hidden and shown by
 * clicking the header. The first child is shown by default.
 * May contain one or two child component. Doesn't support a pane component as a child.
 */
exxcellent.Expander = Core.extend(Echo.Component, {

    $load: function () {
        Echo.ComponentFactory.registerType("exxcellent.Expander", this);
    },

    /** Properties defined for this component. */
    $static: {
        HIDE_TEXT: "hideText",
        HIDE_IMAGE: "hideImage",

        SHOW_TXT: "showText",
        SHOW_IMAGE: "showImage",

        TITLE: "title",
        SPEED: "speed",
        ROLLOVER_BORDER: "rolloverBorder",
        ROLLOVER_FOREGROUND: "rolloverForeground",
        ROLLOVER_BACKGROUND: "rolloverBackground",
        ROLLOVER_BACKGROUND_IMAGE: "rolloverBackgroundImage",

        TITLE_FOREGROUND: "titleForeground",
        TITLE_FONT: "titleFont",
        TITLE_INSETS: "titleInsets",
        TITLE_POSITION: "titlePosition",

        HEADER_BACKGROUND: "headerBackground",
        HEADER_BACKGROUND_IMAGE: "headerBackgroundImage",
        HEADER_BORDER: "headerBorder",
        HEADER_HEIGHT: "headerHeight",
        HEADER_INSETS: "headerInsets",

        BORDER: "border",
        INSETS: "insets",

        ICON_TEXT_MARGIN_TOP: "iconTextMarginTop",
        ICON_TEXT_MARGIN: "iconTextMargin",
        ICON_TEXT_FOREGROUND: "iconTextForeground",
        ICON_TEXT_FONT: "iconTextFont",

        FOCUSED_BACKGROUND: "focusedBackground",
        FOCUSED_BACKGROUND_IMAGE: "focusedBackgroundImage",
        FOCUSED_BORDER: "focusedBorder",

        CONTENT_TOGGLED: "contentToggled",
        SHOW: "show",
        HEADER_HIDE: "headerHide"
    },

    /** @see Echo.Component#componentType */
    componentType: "exxcellent.Expander",
    focusable: true,

    /**
     * Performed after the expander toggled the content.
     * @param shown true if the the visible child is shown. Otherwise false if no or the second child is shown.
     */
    doContentToggled: function (shown) {
        this.fireEvent({
            type: exxcellent.Expander.CONTENT_TOGGLED,
            source: this,
            data: shown
        });
    }
});

/**
 * Component rendering peer: Expander.
 */
exxcellent.ExpanderSync = Core.extend(Echo.Render.ComponentSync, {

    /** Default rendering values used when component does not specify a property value. */
    $static: {
        DEFAULTS: {
            headerInsets: "0px",
            titleInsets: "0px",
            iconTextMarginRL: "5px",
            iconTextMarginTop: "10px",
            showInitially: true,
            headerHide: false
        },
        _supportedPartialProperties: [
            exxcellent.Expander.SHOW]
    },

    $load: function () {
        Echo.Render.registerPeer("exxcellent.Expander", this);
    },

    _div: null,  // Main outer DIV element containing the echo renderId.
    _mDiv: null, // The title section containg the title and arrow thing.
    _showDiv: null, // the first child div content.
    _showRenderID: null, // holds a reference to the renderID mainly to identify the components during update replacemnt
    _hideDiv: null, // the second child div content.
    _hideRenderID: null, // holds a reference to the renderID mainly to identify the components during update replacemnt
    _imgSpn: null, // the image span containing the fold/ collapse image.
    _txtDiv: null, // the text span containing the fold/ collapse text.
    _titleDiv: null, // the title div
    _shown: null, // the state of the expander. True if the first child is shown, otherwise false.


    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function (update, parentElement) {
        this._div = document.createElement("div");
        this._div.id = this.component.renderId;
        this._div.tabIndex = "0";// because of "0" it will take part in the focus cycle, otherwise "-1"
        this._div.style.outlineStyle = "none";
        this._div.style.overflow = "hidden";

        Echo.Sync.renderComponentDefaults(this.component, this._div);
        Echo.Sync.Border.render(this.component.render(exxcellent.Expander.BORDER), this._div);
        Echo.Sync.Insets.render(this.component.render(exxcellent.Expander.INSETS), this._div, "padding");

        // register events
        Core.Web.Event.add(this._div, "keydown", Core.method(this, this._processKeyPress), false);
        Core.Web.Event.add(this._div, "focus", Core.method(this, this._processFocus), false);
        Core.Web.Event.add(this._div, "blur", Core.method(this, this._processBlur), false);

        if (!this.component.render(exxcellent.Expander.HEADER_HIDE)) {
            this._renderHeader(update);
        }
        this._renderChildren(update);

        parentElement.appendChild(this._div);
    },

    /**
     * Renders the interactive header and registers the events used for rollover and click events.
     * @param update used for incremental renderUpdate
     */
    _renderHeader: function (update) {
        this._mDiv = document.createElement("div");
        this._mDiv.style.cursor = "pointer";

        var headerHeight = this.component.render(exxcellent.Expander.HEADER_HEIGHT);
        Echo.Sync.Extent.render(headerHeight, this._mDiv, "height", false, false);
        Echo.Sync.Border.render(this.component.render(exxcellent.Expander.HEADER_BORDER), this._mDiv);
        Echo.Sync.Insets.render(this.component.render(exxcellent.Expander.HEADER_INSETS,
            exxcellent.ExpanderSync.DEFAULTS.headerInsets), this._mDiv, "padding");

        this._titleDiv = document.createElement("div");
        this._renderTitle(update);

        var titlePos = this.component.render(exxcellent.Expander.TITLE_POSITION);
        this._titleDiv.style.cssFloat = titlePos === "left" ? "left" : "right";
        this._titleDiv.style.styleFloat = titlePos === "left" ? "left" : "right";

        function mouseOverHeader() {
            this._rolloverHeader(true);
        }

        function mouseOutHeader() {
            this._rolloverHeader(false);
        }

        Core.Web.Event.add(this._mDiv, "click", Core.method(this, this._toggleContent), false);
        Core.Web.Event.add(this._mDiv, "mouseover", Core.method(this, mouseOverHeader), false);
        Core.Web.Event.add(this._mDiv, "mouseout", Core.method(this, mouseOutHeader), false);

        var isLeft = titlePos === "left";
        this._txtDiv = document.createElement("div");
        this._txtDiv.style.cssFloat = isLeft ? "right" : "left";
        this._txtDiv.style.styleFloat = isLeft ? "right" : "left";
        // img span spacing depending on postion (left right)
        var iconTextMarginTop = Echo.Sync.Extent.toCssValue(
            this.component.render(exxcellent.Expander.ICON_TEXT_MARGIN_TOP,
                exxcellent.ExpanderSync.DEFAULTS.iconTextMarginTop), false, false);
        var iconTextMarginRL = Echo.Sync.Extent.toCssValue(
            this.component.render(exxcellent.Expander.ICON_TEXT_MARGIN,
                exxcellent.ExpanderSync.DEFAULTS.iconTextMarginRL), true, false);
        this._txtDiv.style.margin = isLeft
            ? iconTextMarginTop + " " + iconTextMarginRL + " 0 0"
            : iconTextMarginTop + " 0 0 " + iconTextMarginRL;

        Echo.Sync.Font.render(this.component.render(exxcellent.Expander.ICON_TEXT_FONT), this._txtDiv);
        Echo.Sync.Color.render(this.component.render(exxcellent.Expander.ICON_TEXT_FOREGROUND), this._txtDiv, "color");

        var imgDiv = document.createElement("div");
        imgDiv.style.cssFloat = isLeft ? "right" : "left";
        imgDiv.style.styleFloat = isLeft ? "right" : "left"; // IE used styleFloat...
        imgDiv.style.margin = iconTextMarginTop + " 0 0 0";

        this._imgSpn = document.createElement("span");
        this._imgSpn.style.display = "block";
        this._imgSpn.style.width = "10px";
        this._imgSpn.style.height = "10px";
        this._imgSpn.style.margin = "0 0 -5px 0"; // top right bottom left

        imgDiv.appendChild(this._imgSpn);

        this._mDiv.appendChild(this._titleDiv);
        this._mDiv.appendChild(imgDiv);
        this._mDiv.appendChild(this._txtDiv);

        this._div.appendChild(this._mDiv);

        // initially the 'action' hint text is hidden
        $(this._txtDiv).hide();

        // to enable all visual effects on the header we perform a static rollover
        this._rolloverHeader(false);
    },

    /**
     * Renders the title from the 3rd component in the components array.
     * @param update
     */
    _renderTitle: function (update) {
        var titleChild = this.component.getComponent(2);

        // Either render a simple text node including font and color style
        if (!titleChild) {
            var titleTxt = this.component.render(exxcellent.Expander.TITLE);
            this._titleDiv.appendChild(document.createTextNode(titleTxt));
            Echo.Sync.Insets.render(this.component.render(exxcellent.Expander.TITLE_INSETS,
                exxcellent.ExpanderSync.DEFAULTS.titleInsets), this._titleDiv, "padding");
            Echo.Sync.Font.render(this.component.render(exxcellent.Expander.TITLE_FONT), this._titleDiv);
            Echo.Sync.Color.render(this.component.render(exxcellent.Expander.TITLE_FOREGROUND), this._titleDiv, "color");
        } else {
            // Render the 3rd child component as title

            this._renderContent(titleChild, this._titleDiv, update, this._div);
        }


    },

    /**
     * Renders the children of this Container. The container handles only one or two children.
     * The initially visible child is depending on the visible_child_idx property. The first child is
     * always the one shown by default.
     * <ul>
     *  <li>If two children exists, the first child is shown by default. A click on the header will hide the first child and show the second child.</li>
     *  <li>If only one child is provided, this child will be visible by default. A click on the header will hide the child.</li>
     * </ul>
     * @param update the update from the renderUpdate and renderAdd method.
     */
    _renderChildren: function (update) {
        this._showDiv = document.createElement("div"); // mandatory - shown child
        this._showDiv.style.overflow = "auto";
        this._showDiv.style.clear = "both";
        this._hideDiv = document.createElement("div"); // optional - hide child - may be empty

        var showInit = this.component.render(exxcellent.Expander.SHOW, exxcellent.ExpanderSync.DEFAULTS.showInitially);
        var showChild = this.component.getComponent(0);
        this._renderContent(showChild, this._showDiv, update, this._div);
        this._showRenderID = showChild.renderId;
        if (this.component.getComponentCount() > 1) {
            var hideChild = this.component.getComponent(1);
            this._renderContent(hideChild, this._hideDiv, update, this._div);
            this._hideRenderID = hideChild.renderId;
            if (!showInit) {
                $(this._showDiv).hide();
            } else {
                $(this._hideDiv).hide();
            }
        } else {
            if (!showInit) {
                $(this._showDiv).hide();
            }
        }
        this._shown = showInit;
        this._toggleHeader(showInit);
    },

    /**
     * Renders the header rollover effect. This is usually used to give the user some
     * feedback that the header is interactive, e.g. can be clicked.
     * @param rolloverState if true the rollover effect is applied otherwise its removed
     */
    _rolloverHeader: function (rolloverState) {
        var foreground = Echo.Sync.getEffectProperty(this.component,
            exxcellent.Expander.TITLE_FOREGROUND, exxcellent.Expander.ROLLOVER_FOREGROUND, rolloverState);
        var background = Echo.Sync.getEffectProperty(this.component,
            exxcellent.Expander.HEADER_BACKGROUND, exxcellent.Expander.ROLLOVER_BACKGROUND, rolloverState);
        var backgroundImage = Echo.Sync.getEffectProperty(
            this.component, exxcellent.Expander.HEADER_BACKGROUND_IMAGE,
            exxcellent.Expander.ROLLOVER_BACKGROUND_IMAGE, rolloverState);
        var border = Echo.Sync.getEffectProperty(this.component,
            exxcellent.Expander.HEADER_BORDER, exxcellent.Expander.ROLLOVER_BORDER, rolloverState);

        Echo.Sync.Color.renderClear(foreground, this._titleDiv, "color");
        Echo.Sync.Color.renderClear(foreground, this._mDiv, "color");
        Echo.Sync.Color.renderClear(background, this._mDiv, "backgroundColor");
        Echo.Sync.FillImage.renderClear(backgroundImage, this._mDiv, "backgroundImage");
        Echo.Sync.Border.renderClear(border, this._mDiv);

        $(this._txtDiv).toggle(rolloverState);
    },

    /**
     * Toggles the header showing the action hint (fold or collapse) text and image
     * according the current visible child.
     * @param hide if true the hide text and image is shown
     */
    _toggleHeader: function (hide) {
        if (this.component.render(exxcellent.Expander.HEADER_HIDE)) {
            return;
        }
        $(this._txtDiv).empty();
        if (hide) {
            this._txtDiv.appendChild(document.createTextNode(this.component.render(exxcellent.Expander.HIDE_TEXT)));
            Echo.Sync.FillImage.render(this.component.render(exxcellent.Expander.HIDE_IMAGE), this._imgSpn);
        } else {
            this._txtDiv.appendChild(document.createTextNode(this.component.render(exxcellent.Expander.SHOW_TXT)));
            Echo.Sync.FillImage.render(this.component.render(exxcellent.Expander.SHOW_IMAGE), this._imgSpn);
        }
    },

    /**
     * Toggles the content from the showDiv to the hideDiv and vice versa.
     */
    _toggleContent: function () {
        var self = this;
        var speed = this.component.render(exxcellent.Expander.SPEED);
        // determine the visible and invisible div
        var visibleDiv = this._shown ? this._showDiv : this._hideDiv;
        var invisibleDiv = this._shown ? this._hideDiv : this._showDiv;

        function showInvisible() {

            // toggle the shown index
            self._shown = !self._shown;
            // sync the component value to reflect the current state
            self.component.set(exxcellent.Expander.SHOW, self._shown);
            self._onContentToggled(self._shown);
            self._toggleHeader(self._shown);

            if (invisibleDiv.innerHTML === "") {
                $(invisibleDiv).toggle();
            } else {
                $(invisibleDiv).slideToggle(speed);
            }

        }

        if (visibleDiv.innerHTML === "") {
            // if there is only one child don't animate the showing of nothing (looks just as a delay)
            $(visibleDiv).toggle(0, showInvisible);
        } else {
            $(visibleDiv).slideToggle(speed, showInvisible);
        }
    },

    /**
     * Renders a content (child) of the Expander.
     *
     * @param {Element} child the child element that shall be rendered
     * @param {Element} div DOM DIV element used to render the content inside
     * @param {Echo.Update.ComponentUpdate} update the update
     * @param {Element} parentElement the element to which the content should be appended
     */
    _renderContent: function (child, div, update, parentElement) {

        this._renderChildLayoutData(child, div);
        Echo.Render.renderComponentAdd(update, child, div);

        parentElement.appendChild(div);
    },

    /**
     * Renderes a content replacement of some Elements
     *
     * @param update
     */
    _renderContentReplaced: function (update) {
        var removedChildList = update.getRemovedChildren();
        var addedChildList = update.getAddedChildren();
        if (removedChildList && addedChildList) {
            // we can only handle one removment one time
            var newChild = addedChildList[0];
            var removedChild = removedChildList[0];
            if (this._hideRenderID == removedChild.renderId) {
                // dispose old
                $(this._hideDiv).empty(); // clear div
                Echo.Render.renderComponentDispose(update, removedChild);
                $(this._hideDiv).empty(); // clear div
                // add new
                this._renderContent(newChild, this._hideDiv, update, this._div);
                this._hideRenderID = newChild.renderId;
            } else if (this._showRenderID == removedChild.renderId) {
                // dispose old
                $(this._showDiv).empty(); // clear div
                Echo.Render.renderComponentDispose(update, removedChild);
                $(this._showDiv).empty(); // clear div
                // add new
                this._renderContent(newChild, this._showDiv, update, this._div);
                this._showRenderID = newChild.renderId;
            }
        }
    },

    /** @see Echo.Sync.ArrayContainer#renderChildLayoutData */
    _renderChildLayoutData: function (child, cellElement) {
        var layoutData = child.render("layoutData");
        if (layoutData) {
            Echo.Sync.Color.render(layoutData.background, cellElement, "backgroundColor");
            Echo.Sync.FillImage.render(layoutData.backgroundImage, cellElement);
            Echo.Sync.Insets.render(layoutData.insets, cellElement, "padding");
            Echo.Sync.Alignment.render(layoutData.alignment, cellElement, true, this.component);
            if (layoutData.height) {
                cellElement.style.height = Echo.Sync.Extent.toPixels(layoutData.height, false) + "px";
            }
        }
    },

    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function (update) {
        this._mDiv = null;
        this._showDiv = null;
        this._showRenderID = null;
        this._hideDiv = null;
        this._hideRenderID = null;
        this._imgSpn = null;
        this._txtDiv = null;
        this._showState = null;
        this._div = null;
    },

    /** @see Echo.Render.ComponentSync#renderUpdate */
    renderUpdate: function (update) {
        var fullRender = !Core.Arrays.containsAll(exxcellent.ExpanderSync._supportedPartialProperties,
            update.getUpdatedPropertyNames(), true);

        if (fullRender) {
            var element = this._div;
            var containerElement = element.parentNode;
            Echo.Render.renderComponentDispose(update, update.parent);
            containerElement.removeChild(element);
            this.renderAdd(update, containerElement);
            return true; // Child elements are supported: safe to return true.
        } else {
            // if it's not yet a full render, check if some childs have been added or removed
            if (update.hasRemovedChildren || update.hasAddedChildren) {
                this._renderContentReplaced(update);
            }
            if (update.hasUpdatedProperties()) {
                var visibleIdxUpdate = update.getUpdatedProperty(exxcellent.Expander.SHOW);
                if (visibleIdxUpdate) {
                    // toggle if the state is different
                    if (this._shown !== visibleIdxUpdate.newValue) {
                        this._toggleContent();
                    }
                }
            }
            return false; // no update on the children
        }
    },

    /** Event triggered after the expander toggled the content.*/
    _onContentToggled: function (shown) {
        this.component.doContentToggled(shown);
        return false;
    },

    /** @see Echo.Render.ComponentSync#getFocusFlags */
    getFocusFlags: function () {
        return Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_ALL;
    },

    /** @see Echo.Render.ComponentSync#renderFocus */
    renderFocus: function () {
        this._renderFocusStyle(true);
        Core.Web.DOM.focusElement(this._div);
        //this.client.application.setFocusedComponent(this.component);
    },

    _processFocus: function (e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return true;
        }
        this.client.application.setFocusedComponent(this.component);
    },

    /** Processes a focus blur event. */
    _processBlur: function (e) {
        this._renderFocusStyle(false);
    },

    _renderFocusStyle: function (focusState) {
        // Render default focus aesthetic.
        this._rolloverHeader(focusState);

        // render focus stuff (iv available)
        var background = Echo.Sync.getEffectProperty(this.component, exxcellent.Expander.HEADER_BACKGROUND, exxcellent.Expander.FOCUSED_BACKGROUND, focusState);
        var backgroundImage = Echo.Sync.getEffectProperty(
            this.component, exxcellent.Expander.HEADER_BACKGROUND_IMAGE,
            exxcellent.Expander.FOCUSED_BACKGROUND_IMAGE, focusState);
        var border = Echo.Sync.getEffectProperty(this.component, exxcellent.Expander.HEADER_BORDER, exxcellent.Expander.FOCUSED_BORDER, focusState);

        Echo.Sync.Color.renderClear(background, this._mDiv, "backgroundColor");
        Echo.Sync.FillImage.renderClear(backgroundImage, this._mDiv, "backgroundImage");
        Echo.Sync.Border.renderClear(border, this._mDiv);
    },

    /** Processes a key press event. */
    _processKeyPress: function (e) {
        // only toggle content, when a keyPress is triggered by a BOX-DIV
        if (!this.client || !this.client.verifyInput(this.component) || e.target.nodeName != 'DIV') {
            return true;
        }
        if (e.keyCode === 13 || e.keyCode === 40 || e.keyCode === 38
            || e.keyCode === 37 || e.keyCode === 39) {
            this._toggleContent();
            return true;
        } else {
            return true;
        }
    }
});
/**
 * Component implementation for a FlexiGrid
 */
exxcellent.FlexiGrid = Core.extend(Echo.Component, {

    $load: function () {
        Echo.ComponentFactory.registerType("exxcellent.FlexiGrid", this);
    },

    /** Properties defined for this component. */
    $static: {
        HEIGHT_OFFSET: "heightOffset",
        TABLE_ROW_SELECT: "tableRowSelect",
        TABLE_COLUMN_TOGGLE: "tableColumnToggle",
        TABLE_SORTING_CHANGE: "tableSortingChange",
        TABLE_COLUMN_ARRANGED: "tableColumnArrange",
        TABLE_COLUMN_RESIZED: "tableColumnResize",
        TABLE_RESIZED: "tableResize",
        DIGITGROUP_DELIMITER: "digitGroupDelimiter",
        DECIMAL_DELIMITER: "decimalDelimiter",
        CSS: "css",
        CLIENT_SORTING: "clientSorting",
        WIDTH: "width",
        HEIGHT: "height",
        COLUMN_WIDTH_UNIT: "columnWidthUnit",
        TITLE: "title",
        SHOWTABLE_TOGGLE: "showTableToggle",
        SORTINGMODEL: "sortingModel",
        COLUMNMODEL: "columnModel",

        ACTIVE_PAGE: "activePage",
        ACTIVE_PAGE_CHANGED: "activePageChanged",

        SHOW_PAGER: "showPager",
        SHOW_PAGE_STAT: "showPageStatistics",
        SHOW_RESULTS_PPAGE: "showResultsPerPage",
        RESULTS_PPAGE_OPTION: "resultsPerPageOption",
        NO_ITEMS_MSG: "noItemsMessage",
        PROCESS_MSG: "messageProcessing",
        HIDE_COLUMN_MSG: "messageColumnHiding",
        MIN_TABLE_MSG: "messageTableHiding",
        PAGE_STATISTICS_MSG: "messagePageStatistics",
        RESIZABLE: "resizable",
        STRIPED: "striped",
        MIN_COLUMN_WIDTH: "minColumnWidth",
        MIN_COLUMN_HEIGHT: "minColumnHeight",
        NO_WRAP: "noWrap",
        SINGLE_SELECT: "singleSelect",
        LINE_IMG: "LINE_IMG",
        HL_IMG: "HL_IMG",
        FHBG_IMG: "FHBG_IMG",
        DDN_IMG: "DDN_IMG",
        WBG_IMG: "WBG_IMG",
        UUP_IMG: "UUP_IMG",
        BGROUND_IMG: "BGROUND_IMG",
        DOWN_IMG: "DOWN_IMG",
        UP_IMG: "UP_IMG",
        PREV_IMG: "PREV_IMG",
        MAGNIFIER_IMG: "MAGNIFIER_IMG",
        FIRST_IMG: "FIRST_IMG",
        NEXT_IMG: "NEXT_IMG",
        LAST_IMG: "LAST_IMG",
        LOAD_IMG: "LOAD_IMG",
        LOAD_BTN_IMG: "LOAD_BTN_IMG"
    },

    componentType: "exxcellent.FlexiGrid",
    focusable: true,
    /** @see Echo.Component#pane */
    pane: true,

    /** Perform when an select row action is triggered in the flexigrid. */
    doSelectRow: function (rowSelection) {
        // Notify table row select listeners.
        this.fireEvent({
            type: exxcellent.FlexiGrid.TABLE_ROW_SELECT,
            source: this,
            data: rowSelection
        });
    },

    doChangePage: function (pageId) {
        // Notify table row select listeners.
        this.fireEvent({
            type: exxcellent.FlexiGrid.ACTIVE_PAGE_CHANGED,
            source: this,
            data: pageId
        });
    },

    /** Performed when a toggle column action is triggered in the flexigrid. */
    doToggleColumn: function (columnVisibility) {
        // Notify table column visibility toggle listeners.
        this.fireEvent({
            type: exxcellent.FlexiGrid.TABLE_COLUMN_TOGGLE,
            source: this,
            data: columnVisibility
        });
    },

    /** Performed when the sorting of columns changes. */
    doChangeSorting: function (sortingModel) {
        // Notify table column sorting change listeners.
        this.fireEvent({
            type: exxcellent.FlexiGrid.TABLE_SORTING_CHANGE,
            source: this,
            data: sortingModel
        });
    },

    /** Performed when the columns order changes because of user drag and drop. */
    doArrangeColumn: function (arrangeModel) {
        // Notify table column arrangement change listeners.
        this.fireEvent({
            type: exxcellent.FlexiGrid.TABLE_COLUMN_ARRANGED,
            source: this,
            data: arrangeModel
        });
    },

    /** Performed when the columns size changes because of user drag and drop. */
    doResizeColumn: function (columnResizeModel) {
        // Notify table column size change listeners.
        this.fireEvent({
            type: exxcellent.FlexiGrid.TABLE_COLUMN_RESIZED,
            source: this,
            data: columnResizeModel
        });
    },

    /** Performed when the table size changes because of user drag and drop. */
    doResizeTable: function (tableResizeModel) {
        // Notify table table size change listeners.
        this.fireEvent({
            type: exxcellent.FlexiGrid.TABLE_RESIZED,
            source: this,
            data: tableResizeModel
        });
    }
});

/** The column model object describes table columns. */
exxcellent.model.ColumnModel = Core.extend({
    /**
     * An array of exxcellent.model.Column.
     * @type exxcellent.model.Column
     */
    columns: null,

    $construct: function (columns) {
        this.columns = columns;
    },

    getColumns: function () {
        return this.columns;
    },

    /** Return the string representation of this model. */
    toString: function () {
        return this.columns;
    }
});

/** The column object for any grid based component. */
exxcellent.model.Column = Core.extend({
    /** The id of the column */
    name: null,

    /** The name (title) for the column. */
    display: null,

    /**
     * The width for this colum.
     */
    width: null,

    /**
     * Defines if the column is sortable.
     */
    sortable: null,

    /**
     * Defines the alignment: 'left', 'right', 'center'
     * @type String
     */
    align: null,

    /**
     * The tooltip displayed if the user hovers over the column
     * @type String the tooltip
     */
    tooltip: null,

    $construct: function (name, display, width, sortable, align, tooltip) {
        this.name = name;
        this.display = display;
        this.width = width;
        this.sortable = sortable;
        this.align = align;
        this.tooltip = tooltip;
    },

    /** Return the string representation of this column. */
    toString: function () {
        return this.name;
    }
});

/** The data object for any grid based component. */
exxcellent.model.Row = Core.extend({
    /** The id of the row */
    id: null,

    /**
     * The data for this row as index based array,
     * e.g. ["value a", "value b"].
     */
    cell: null,

    $construct: function (id, cell) {
        this.id = id;
        this.cell = cell;
    },

    /** Return the string representation of this row. */
    toString: function () {
        return this.id;
    }
});

/** The page object for any grid based component. */
exxcellent.model.Page = Core.extend({
    /** page number */
    page: 1,
    /** amount if rows in the page*/
    total: 1,
    /** array of exxcellent.model.Row objects */
    rows: null,

    $construct: function (page, total, rows) {
        this.page = page;
        this.total = total;
        this.rows = rows;
    },

    /** Return the string representation of this model. */
    toString: function () {
        return this.page;
    }
});
/** The table model object for any grid based component. */
exxcellent.model.TableModel = Core.extend({
    /**
     * An array of exxcellent.model.Row
     * @type exxcellent.model.Page
     */
    pages: null,

    $construct: function (pages) {
        this.pages = pages;
    },

    /** Return the string representation of this table model. */
    toString: function () {
        return this.pages;
    }
});
/** The results per page model object for any grid based component. */
exxcellent.model.ResultsPerPageOption = Core.extend({
    /**
     * An array of int, e.g. [10,25,50]
     * @type int[]
     */
    pageOptions: null,

    /**
     * An initial value preselected as results per page
     * @type int
     */
    initialOption: null,

    $construct: function (initialOption, pageOptions) {
        this.initialOption = initialOption;
        this.pageOptions = pageOptions;
    },

    /** Return the string representation of this model. */
    toString: function () {
        return this.initialOption + " of " + this.pageOptions;
    }
});
/** The sorting model object contains column names (id) and a sorting order. */
exxcellent.model.SortingModel = Core.extend({
    /**
     * An array of exxcellent.model.SortingColumn.
     * @type exxcellent.model.SortingColumn
     */
    columns: null,

    $construct: function (columns) {
        this.columns = columns;
    },

    getColumns: function () {
        return this.columns;
    },

    /** Return the string representation of this model. */
    toString: function () {
        return this.columns;
    }
});

/** The sorting column describes a colum by its name (id) and a sorting order. */
exxcellent.model.SortingColumn = Core.extend({
    /**
     * An column identifier, e.g. '10'
     * @type int
     */
    columnId: null,

    /**
     * An order value, e.g. 'asc' or 'desc'
     * @type String
     */
    sortOrder: null,

    $construct: function (columnId, sortOrder) {
        this.columnId = columnId;
        this.sortOrder = sortOrder;
    },

    /** Return the string representation of this model. */
    toString: function () {
        return this.columnId + " ordered " + this.sortOrder;
    }
});

/**
 * Component rendering peer: FlexiGrid.
 */
exxcellent.FlexiGridSync = Core.extend(Echo.Render.ComponentSync, {

    $load: function () {
        Echo.Render.registerPeer("exxcellent.FlexiGrid", this);
    },

    /** root div as container for the flexigrid. */
    _div: null,
    _flexigrid: null,

    _table: null,
    _tableModel: null,
    _activePage: null,
    _sortingModel: null,
    _resultsPerPageOption: null,
    _renderRequired: null,
    _waitDialogHandle: null,

    /**
     * Describes how a component is initially built.
     */
    renderAdd: function (update, parentElement) {
        /*
         * the root div with and table inside.
         * The table will be manipulated by the flexigrid plugin by adding surrounding
         * div elements.
         */
        this._div = document.createElement("div");
        /*
         * set tabindex="0", otherwise its non-focusable component.
         * @see: http://echo.nextapp.com/site/node/5979
         */
        this._div.tabIndex = "0";
        this._div.style.outlineStyle = "none";
        this._div.style.overflow = "hidden";

        this._div.id = this.component.renderId;
        this._table = document.createElement("table");
        this._div.appendChild(this._table);

        // Register Key up events for actions
        Core.Web.Event.add(this._div, "keydown", Core.method(this, this._processKeyPress), false);
        Core.Web.Event.add(this._div, "blur", Core.method(this, this._processBlur), false);

        Echo.Sync.renderComponentDefaults(this.component, this._div);
        parentElement.appendChild(this._div);

        if (jQuery("#flexigridCss").length === 0) {
            var stylesheet = this._createStylesheet();
            jQuery("head").append("<style type=\"text/css\" id=\"flexigridCss\">" + stylesheet + "</style>");
        }

        this._renderRequired = true;
    },

    /**
     * Describes how the component is destroyed.
     */
    renderDispose: function () {
        // These cleanup things are CRUCICAL to avoid DRASTIC memory leaks.
        //
        // Remove out attached keylisteners from the DIV
        Core.Web.Event.removeAll(this._div);
        // Call internal flexigrid destroy.
        if (this._flexigrid) {
            // only destroy it, when it's not already null see: https://github.com/exxcellent/echolot/issues/6
            this._flexigrid.flexDestroy();
        }

        this._table = null;
        this._flexigrid = null;
        this._tableModel = null;
        this._sortingModel = null;
        this._resultsPerPageOption = null;
        this._div = null;
        if (this._waitDialogHandle !== null) {
            this.client.removeInputRestriction(this._waitDialogHandle);
        }
        this.__waitDialogHandle = null;
    },

    /**
     * Describes how a component is updated, e.g. destroyed and build again. The
     * FlexiGrid supports partially updates only for the TableModel, SortingModel,
     * but not for any semantic model, such as ColumnModel.
     */
    renderUpdate: function (update) {
        var partitialUpdate = true;
        var updatedProperties = update.getUpdatedPropertyNames();

        if (updatedProperties.length === 0) {
            // there are some cases were an empty update is triggered - that can lead to errors in IE so just go back with true because nothing to do for us
            return true;
        }

        if (Core.Arrays.indexOf(
            updatedProperties, exxcellent.FlexiGrid.COLUMNMODEL) >= 0) {
            partitialUpdate = false;
        }

        if (!partitialUpdate) {
            // destroy the container and add it again
            var element = this._div;
            var containerElement = element.parentNode;
            Echo.Render.renderComponentDispose(update, update.parent);
            containerElement.removeChild(element);
            this.renderAdd(update, containerElement);
        } else {
            // only reload the data rows
            var options = this._renderUpdateOptions();
            this._flexigrid.flexOptions(options);
            this._flexigrid.flexReload();
        }
        return true;
    },

    /**
     * Describes how the component renders itself.
     */
    renderDisplay: function () {
        if (this._renderRequired) {
            this._renderRequired = false;

            var options = this._renderOptions();
            this._flexigrid = $(this._table).flexigrid(options);
        }
    },

    _renderOptions: function () {
        var resultsPerPageOption = this._getResultsPerPageOption();
        var gridWidth = this.component.render(exxcellent.FlexiGrid.WIDTH);
        var gridHeight = this.component.render(exxcellent.FlexiGrid.HEIGHT);

        return {
            owner: this,
            method: 'GET',
            url: this,
            dataType: 'json',
            autoload: true,
            onPopulateCallback: this._onPopulate,
            onChangeSort: this._onChangeSorting,
            onToggleCol: this._onToggleColumnVisibilty,
            onSelectRow: this._onSelectRow,
            onSuccess: this._onPopulateFinish,
            onDragCol: this._onArrangeColumn,
            onChangePage: this._onChangePage,
            onResizeCol: this._onResizeColumn,
            onResizeGrid: this._onResizeGrid,
            sortModel: this._getSortingModel(),
            colModel: this._getColumnModel(),
            showPageStat: this.component.render(exxcellent.FlexiGrid.SHOW_PAGE_STAT),
            width: (!gridWidth || gridWidth === -1) ? 'auto' : gridWidth * 1,
            height: (!gridHeight || gridHeight === -1) ? 'auto' : gridHeight * 1,
            showTableToggleBtn: this.component.render(exxcellent.FlexiGrid.SHOWTABLE_TOGGLE),
            title: this.component.render(exxcellent.FlexiGrid.TITLE),
            usepager: this.component.render(exxcellent.FlexiGrid.SHOW_PAGER),
            useRp: this.component.render(exxcellent.FlexiGrid.SHOW_RESULTS_PPAGE),
            rp: resultsPerPageOption.initialOption,
            rpOptions: resultsPerPageOption.pageOptions,
            nomsg: this.component.render(exxcellent.FlexiGrid.NO_ITEMS_MSG),
            procmsg: this.component.render(exxcellent.FlexiGrid.PROCESS_MSG),
            hidecolmsg: this.component.render(exxcellent.FlexiGrid.HIDE_COLUMN_MSG),
            mintablemsg: this.component.render(exxcellent.FlexiGrid.MIN_TABLE_MSG),
            pagestat: this.component.render(exxcellent.FlexiGrid.PAGE_STATISTICS_MSG),
            resizable: this.component.render(exxcellent.FlexiGrid.RESIZABLE),
            striped: this.component.render(exxcellent.FlexiGrid.STRIPED),
            minwidth: this.component.render(exxcellent.FlexiGrid.MIN_COLUMN_WIDTH),
            minheight: this.component.render(exxcellent.FlexiGrid.MIN_COLUMN_HEIGHT),
            nowrap: this.component.render(exxcellent.FlexiGrid.NO_WRAP),
            singleSelect: this.component.render(exxcellent.FlexiGrid.SINGLE_SELECT),
            clientsort: this.component.render(exxcellent.FlexiGrid.CLIENT_SORTING),
            digitGroupDL: this.component.render(exxcellent.FlexiGrid.DIGITGROUP_DELIMITER),
            decimalDelimiter: this.component.render(exxcellent.FlexiGrid.DECIMAL_DELIMITER),
            heightOffset: this.component.render(exxcellent.FlexiGrid.HEIGHT_OFFSET)
        };
    },
    _renderUpdateOptions: function () {
        var resultsPerPageOption = this._getResultsPerPageOption();
        var gridWidth = this.component.render(exxcellent.FlexiGrid.WIDTH);
        var gridHeight = this.component.render(exxcellent.FlexiGrid.HEIGHT);

        return Object({
            showPageStat: this.component.render(exxcellent.FlexiGrid.SHOW_PAGE_STAT),
            width: (!gridWidth || gridWidth === -1) ? 'auto' : gridWidth * 1,
            height: (!gridHeight || gridHeight === -1) ? 'auto' : gridHeight * 1,
            showTableToggleBtn: this.component.render(exxcellent.FlexiGrid.SHOWTABLE_TOGGLE),
            title: this.component.render(exxcellent.FlexiGrid.TITLE),
            usepager: this.component.render(exxcellent.FlexiGrid.SHOW_PAGER),
            useRp: this.component.render(exxcellent.FlexiGrid.SHOW_RESULTS_PPAGE),
            rp: resultsPerPageOption.initialOption,
            rpOptions: resultsPerPageOption.pageOptions,
            nomsg: this.component.render(exxcellent.FlexiGrid.NO_ITEMS_MSG),
            procmsg: this.component.render(exxcellent.FlexiGrid.PROCESS_MSG),
            hidecolmsg: this.component.render(exxcellent.FlexiGrid.HIDE_COLUMN_MSG),
            mintablemsg: this.component.render(exxcellent.FlexiGrid.MIN_TABLE_MSG),
            pagestat: this.component.render(exxcellent.FlexiGrid.PAGE_STATISTICS_MSG),
            resizable: this.component.render(exxcellent.FlexiGrid.RESIZABLE),
            striped: this.component.render(exxcellent.FlexiGrid.STRIPED),
            minwidth: this.component.render(exxcellent.FlexiGrid.MIN_COLUMN_WIDTH),
            minheight: this.component.render(exxcellent.FlexiGrid.MIN_COLUMN_HEIGHT),
            nowrap: this.component.render(exxcellent.FlexiGrid.NO_WRAP),
            singleSelect: this.component.render(exxcellent.FlexiGrid.SINGLE_SELECT),
            clientsort: this.component.render(exxcellent.FlexiGrid.CLIENT_SORTING),
            digitGroupDL: this.component.render(exxcellent.FlexiGrid.DIGITGROUP_DELIMITER),
            decimalDelimiter: this.component.render(exxcellent.FlexiGrid.DECIMAL_DELIMITER),
            heightOffset: this.component.render(exxcellent.FlexiGrid.HEIGHT_OFFSET)
        });
    },

    /**
     * Creates a stylesheet with dynamically replaced images.
     * @return css String
     */
    _createStylesheet: function () {
        var css = this.component.render(exxcellent.FlexiGrid.CSS);
        if (css) {
            css = css.replace(/LINE_IMG/g, this.component.render(exxcellent.FlexiGrid.LINE_IMG));
            css = css.replace(/HL_IMG/g, this.component.render(exxcellent.FlexiGrid.HL_IMG));
            css = css.replace(/FHBG_IMG/g, this.component.render(exxcellent.FlexiGrid.FHBG_IMG));
            css = css.replace(/DDN_IMG/g, this.component.render(exxcellent.FlexiGrid.DDN_IMG));
            css = css.replace(/WBG_IMG/g, this.component.render(exxcellent.FlexiGrid.WBG_IMG));
            css = css.replace(/UUP_IMG/g, this.component.render(exxcellent.FlexiGrid.UUP_IMG));
            css = css.replace(/BGROUND_IMG/g, this.component.render(exxcellent.FlexiGrid.BGROUND_IMG));
            css = css.replace(/DOWN_IMG/g, this.component.render(exxcellent.FlexiGrid.DOWN_IMG));
            css = css.replace(/UP_IMG/g, this.component.render(exxcellent.FlexiGrid.UP_IMG));
            css = css.replace(/PREV_IMG/g, this.component.render(exxcellent.FlexiGrid.PREV_IMG));
            css = css.replace(/MAGNIFIER_IMG/g, this.component.render(exxcellent.FlexiGrid.MAGNIFIER_IMG));
            css = css.replace(/FIRST_IMG/g, this.component.render(exxcellent.FlexiGrid.FIRST_IMG));
            css = css.replace(/NEXT_IMG/g, this.component.render(exxcellent.FlexiGrid.NEXT_IMG));
            css = css.replace(/LAST_IMG/g, this.component.render(exxcellent.FlexiGrid.LAST_IMG));
            css = css.replace(/LOAD_IMG/g, this.component.render(exxcellent.FlexiGrid.LOAD_IMG));
            css = css.replace(/LOAD_BTN_IMG/g, this.component.render(exxcellent.FlexiGrid.LOAD_BTN_IMG));
        }
        return css;
    },

    _getActivePage: function () {
        var value = this.component.render(exxcellent.FlexiGrid.ACTIVE_PAGE);
        if (value && value instanceof exxcellent.model.Page) {
            // Client-side usage: property containts page model
            this._activePage = value;
        } else if (value) {
            // Server-side usage: property contains JSON Sting containing the page
            this._activePage = this._fromJsonString(value).activePage;
        }
        return this._activePage;
    },

    /**
     * Method to return the sorting model, even if the provided value was null.
     */
    _getSortingModel: function () {
        var value = this.component.render(exxcellent.FlexiGrid.SORTINGMODEL);
        if (value instanceof exxcellent.model.SortingModel) {
            this._sortingModel = value;
        } else if (value) {
            this._sortingModel = this._fromJsonString(value).sortingModel;
        } else {
            this._sortingModel = {columns: []};
        }
        return this._sortingModel;
    },

    /**
     * Method to return the results per page object.
     */
    _getResultsPerPageOption: function () {
        var value = this.component.render(exxcellent.FlexiGrid.RESULTS_PPAGE_OPTION);
        if (value instanceof exxcellent.model.ResultsPerPageOption) {
            this._resultsPerPageOption = value;
        } else if (value) {
            this._resultsPerPageOption = this._fromJsonString(value).resultsPerPageOption;
        }
        return this._resultsPerPageOption;
    },

    /**
     * Method to parse a JSON string into an object.
     * @see "http://www.json.org/js.html"
     * @param {} jsonStr the string to be transformed into an object
     * @return {} the object
     */
    _fromJsonString: function (jsonStr) {
        return JSON.parse(jsonStr);
    },

    /**
     * Method to convert an object to a json string.
     * @see "http://www.json.org/js.html"
     * @param {} object the object to be transformed into string
     * @return {} the json string
     */
    _toJsonString: function (object) {
        return JSON.stringify(object);
    },

    /**
     * Creates a column model from a given tablemodel
     * @return an columnModel, e.g.
     *         columnModel[
     *                 {display: 'Name', name: 0},
     *                 {display: 'EMail', name: 1}
     * ]
     */
    _getColumnModel: function () {
        var value = this.component.render(exxcellent.FlexiGrid.COLUMNMODEL);
        if (value instanceof exxcellent.model.ColumnModel) {
            this._columnModel = value;
        } else if (value) {
            this._columnModel = this._fromJsonString(value).columnModel;
        }

        var widthUnit = this.component.render(exxcellent.FlexiGrid.COLUMN_WIDTH_UNIT);
        for (var i = 0; i < this._columnModel.columns.length; i++) {
            /* set default values (IE crashes if a number is undefined, i.e. null)*/
            if (!this._columnModel.columns[i].width) {
                this._columnModel.columns[i].width = 100;
            } else {
                /* recalculate the extent into px (value + unit, e.g. 5px) */
                if (widthUnit) {
                    var widthExtent = this._columnModel.columns[i].width + widthUnit;
                    this._columnModel.columns[i].width = Core.Web.Measure.extentToPixels(widthExtent, true);
                }
            }
        }
        return this._columnModel.columns;
    },

    /**
     * Method to populate the grid with new data depending on the given parameter, e.g. sorting, page etc.
     * This method is also triggered by other events such as:
     * - refresh button
     * - _onChangeSorting
     * - _onChangePage
     * - selecting a rows per page option
     */
    _onPopulate: function (param) {
        // This method will be called twice!
        // 1) by flexigrid directly after the "nextpage" click
        // 2) by Sync.FlexiGrid in the renderUpdate() method
        //
        // Intended behaviour: Just lock the screen in the first round and process the updated page
        // in the second round

        // The desired page number
        var page = param[0].value;

        // add an input restriction to have the 'please wait' dialog show explicitly
        // only on update, because otherwise flexigrid will 'puke'
        if (this._waitDialogHandle === null) {
            // if there is already a waitHandle do not create another one so we just create a new if it is null...
            this._waitDialogHandle = this.client.createInputRestriction();
        }

        // CALL Listener
        this.component.doChangePage(page * 1);
        return this._getActivePage();
    },

    _onChangePage: function () {
        // If flexigrid changes page, then we forget the current data in the first place
        this._activePage = null;
        // onPopulate called by the renderUpdate() from echo will provide the new data
        this.component.set(exxcellent.FlexiGrid.ACTIVE_PAGE, null);
    },

    _onPopulateFinish: function () {
        this.client.removeInputRestriction(this._waitDialogHandle);
        this._waitDialogHandle = null;
    },

    /**
     * Method to process the event of changing the sorting.
     * {"sortingModel": {
             *      "columns": [
             *        {
             *          "columnId": 5,
             *          "sortOrder": 'desc'
             *        },
             *        {
             *          "columnId": 10,
             *            "sortOrder": 'asc'
             *       }
             *    ]
             *   }}
     * @param {} sortingModel containing columns with their name column name and sorting
     */
    _onChangeSorting: function (sortingModel) {
        this._sortingModel = sortingModel;

        var columnsArray = [];
        if (sortingModel && sortingModel.columns) {
            for (var i = 0; i < sortingModel.columns.length; i++) {
                var column = sortingModel.columns[i];
                columnsArray.push({
                        columnId: column.columnId * 1, // convert it to a number
                        sortOrder: column.sortOrder
                    }
                );
            }
        }
        var sortingObj = {
            sortingModel: {
                columns: {
                    sortingColumn: columnsArray
                }
            }
        };

        var jsonMessage = this._toJsonString(sortingObj);
        if (this.component.render(exxcellent.FlexiGrid.CLIENT_SORTING)) {
            // client-sorting will no longer work - so this will do just nothing :-)
            this._sortClientSide();
        }
        this.component.doChangeSorting(jsonMessage);
    },

    /**
     * Method responsible to sort the current tableModel using the current sortingModel and current columnModel.
     * The sorting is using the flexMultiSort algorithm and starts refreshing the table model after to redraw
     * the table content. Actually we only set a new table model to refresh the table with the new sortModel.
     */
    _sortClientSide: function () {
        return;
        // After refactoring to lazy loading this does not work any more...
        // if you need this feel free to implement a logic to sort a lazy-loaded model on client-side

        /*
         var newTableModel = new exxcellent.model.TableModel(this._tableModel.pages);
         this.component.set(exxcellent.FlexiGrid.TABLEMODEL, newTableModel);
         */
    },

    /**
     * Method to process the event on changing the visibility of a column.
     * Used JSON format :
     * {"columnVisibility": {
             *      "columnId": 0,
             *      "visible": true
             * }}
     * @param {Number} columnId the column identifier
     * @param {Boolean} visible the state of visibility, either true or false
     */
    _onToggleColumnVisibilty: function (columnId, visible) {
        var toggleObj = {
            columnVisibility: {
                columnId: columnId * 1, // convert it to a number
                visible: !!visible // convert it to boolean
            }
        };
        var jsonMessage = this._toJsonString(toggleObj);
        this.component.doToggleColumn(jsonMessage);
    },

    /**
     * Method to process the event on selecting a cell.
     * Used JSON format :
     * {"rowSelection": {
             *      "rowId": 1
             * }}
     * @param {DIV} celDiv the selected cell div
     * @param {Number} rowId the selected row id
     */
    _onSelectRow: function (rowId, div) {
        var selectionObj = {
            rowSelection: {
                rowId: rowId * 1 // convert it to a number
            }
        };
        var jsonMessage = this._toJsonString(selectionObj);
        this.component.doSelectRow(jsonMessage);
        return false;
    },

    /**
     * Method to process the event on arranging a column,
     * i.e. dragging and dropping a column.
     * Used JSON format :
     * {"columnArrange": {
             *          sourceColumnId: 20,
             *          targetColumnId: 15,
             *      }
             * }
     * @param {String} sourceColumnId the column identifier of the dragged column
     * @param {String} targetColumnId the column identifier of the dropped column
     */
    _onArrangeColumn: function (sourceColumnId, targetColumnId) {
        var columnArrangeObj = {
            columnArrange: {
                sourceColumnId: sourceColumnId, // convert it to a number
                targetColumnId: targetColumnId // convert it to a number
            }
        };
        var jsonMessage = this._toJsonString(columnArrangeObj);
        this.component.doArrangeColumn(jsonMessage);
        return false;
    },

    /**
     * Method to process the event on resizing a column.
     * Used JSON format :
     * {"columnResize": {
             *          columnId: 20,
             *          width: 250
             *      }
             * }
     * @param {String} columnId the column identifier that is resizing
     * @param {Number} newWidth the new width of the resized column
     */
    _onResizeColumn: function (columnId, newWidth) {
        var columnResizeObj = {
            columnResize: {
                columnId: columnId * 1, // convert it to a number
                width: newWidth * 1
            }
        };
        var jsonMessage = this._toJsonString(columnResizeObj);
        this.component.doResizeColumn(jsonMessage);
        return false;
    },

    /**
     * Method to process the event on resizing the table.
     * Used JSON format :
     * {"tableResize": {
             *          width: 200,
             *          height: 400
             *      }
             * }
     * @param {Number} width the new grid width
     * @param {Number} height the new grid height
     */
    _onResizeGrid: function (width, height) {
        var tableResizeObj = {
            tableResize: {
                width: width * 1, // convert it to a number
                height: height * 1 // convert it to a number
            }
        };
        var jsonMessage = this._toJsonString(tableResizeObj);
        this.component.doResizeTable(jsonMessage);
        return false;
    },

    /** Processes a key press event. */
    _processKeyPress: function (e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return true;
        }
        if (e.keyCode === 13 || e.keyCode === 40 || e.keyCode === 38
            || e.keyCode === 37 || e.keyCode === 39) {
            this._flexigrid.flexRemoteControl(e.keyCode);
            return true;
        } else {
            return true;
        }
    },

    /** @see Echo.Render.ComponentSync#getFocusFlags */
    getFocusFlags: function () {
        // we doesn't allow any of the keys: arrow up,down,left,right to change the focus
        return false;
    },

    /** Processes a focus blur event. */
    _processBlur: function (e) {
        this._renderFocusStyle(false);
    },

    /** @see Echo.Render.ComponentSync#renderFocus */
    renderFocus: function () {
        this._renderFocusStyle(true);
        Core.Web.DOM.focusElement(this._div);
    },

    /**
     * Enables/disables focused appearance of flexigrid.
     *
     * @param {Boolean} focusState the new focus state.
     */
    _renderFocusStyle: function (focusState) {
        // Render default focus aesthetic.
        this._flexigrid.flexFocus(focusState);
    }
});
/**
 * Component implementation for KeystrokeListener.
 */
exxcellent.KeystrokeListener = Core.extend(Echo.Component, {

    $load: function () {
        Echo.ComponentFactory.registerType("exxcellent.KeystrokeListener", this);
    },

    /** Properties defined for this component. */
    $static: {
        DEBUG: "debug",
        TARGET_RENDERID: "targetRenderId",
        KEY_CODE: "keyCode",
        ACTION_COMMAND: "actionCommand",
        KEYSTROKE_ACTION: "action"
    },

    componentType: "exxcellent.KeystrokeListener",
    focusable: false,


    doAction: function (actionCommand) {
        this.fireEvent({
            type: "action",
            source: this,
            data: this.render("actionCommand")
        });
    }


});

/**
 * Component rendering peer: KeystrokeListener.
 */
exxcellent.KeystrokeListenerSync = Core.extend(Echo.Render.ComponentSync, {

    $load: function () {
        Echo.Render.registerPeer("exxcellent.KeystrokeListener", this);
    },

    _debug: null, // use debug messages in console or not
    _span: null, // the empty component
    _all_shortcuts: null, // All the shortcuts are stored in this array

    /**
     * Describes how a component is initially built.
     */
    renderAdd: function (update, parentElement) {
        // Empty div - could be ommittet. Yet only for debugging purposes.
        this._span = document.createElement("span");
        this._span.id = this.component.renderId;
        this.component.addListener("parent", Core.method(this, this._parentChanged));

        // parentChange event -> Trigger key listener attaching 
        parentElement.appendChild(this._span);
        this._renderRequired = true;
    },

    _parentChanged: function (e) {
        if (this._debug && window.console && window.console.log) {
            console.log("KeystrokeListener : Parent changed from " + e.oldValue + " to " + e.newValue);
        }
        if (e.newValue === null || typeof e.newValue == 'undefined') {
            this.remove_all_shortcuts();
        }
    },

    /** @see Echo.Render.ComponentSync#renderDisplay */
    renderDisplay: function () {
        if (this._renderRequired) {
            this._renderRequired = false;
            this._debug = this.component.render(exxcellent.KeystrokeListener.DEBUG);
            var keyCode = this.component.render(exxcellent.KeystrokeListener.KEY_CODE);
            var listenerTarget = this.component.render(exxcellent.KeystrokeListener.TARGET_RENDERID);
            var actionCommand = this.component.render(exxcellent.KeystrokeListener.ACTION_COMMAND);

            if (this._debug && window.console && window.console.log) {
                console.log("renderDisplay() called for: " + keyCode);
            }

            this.add_shortcut(keyCode, actionCommand, { target: listenerTarget});
        }
    },

    /**
     * Describes how the component is destroyed.
     */
    renderDispose: function (update) {
        if (this._debug && window.console && window.console.log) {
            console.log("renderDispose() called");
        }
        this.remove_all_shortcuts();
        this._span = null;
        this._all_shortcuts = null;
    },

    /**
     * Describes how a component is updated, e.g. destroyed and build again.
     */
    renderUpdate: function (update) {
        // destroy the container and add it again
        /*var element = this._div;
         var containerElement = element.parentNode;
         Echo.Render.renderComponentDispose(update, update.parent);
         containerElement.removeChild(element);
         this.renderAdd(update, containerElement);*/
        this._renderRequired = true;
        if (this._debug && window.console && window.console.log) {
            console.log("renderUpdate() called, but nothing to do.");
        }

        return false;
    },


    add_shortcut: function (shortcut_combination, actionCommand, opt) {
        //Provide a set of default options
        var default_options = {
            'type': 'keydown',
            'propagate': false,
            'disable_in_input': false,
            'target': document,
            'keycode': false
        };
        if (!opt) {
            opt = default_options;
        }
        else {
            for (var dfo in default_options) {
                if (typeof opt[dfo] == 'undefined') {
                    opt[dfo] = default_options[dfo];
                }
            }
        }

        var ele;
        if (opt.target == "null" || opt.target === null || typeof opt.target == 'undefined') {
            ele = document;
        } else if (typeof opt.target == 'string') {
            ele = document.getElementById(opt.target);
        }
        if (!ele) {
            ele = opt.target;
        }
        shortcut_combination = shortcut_combination.toLowerCase();

        //The function to be called at keypress
        var onKeyEventFunction = function (e) {
            var keyEvent = e || window.event;
            var code;

            /*if(opt['disable_in_input']) { //Don't enable shortcut keys in Input, Textarea fields
             var element;
             if(keyEvent.target) element=keyEvent.target;
             else if(keyEvent.srcElement) element=keyEvent.srcElement;
             if(element.nodeType==3) element=element.parentNode;

             if(element.tagName == 'INPUT' || element.tagName == 'TEXTAREA') return;
             }*/

            //Find Which key is pressed
            if (keyEvent.keyCode) {
                code = keyEvent.keyCode;
            }
            else if (keyEvent.which) {
                code = keyEvent.which;
            }

            if (this._debug && window.console && window.console.log) {
                console.log('Key Event: ' + e + ' triggered keycode: ' + code);
            }
            var character = String.fromCharCode(code).toLowerCase();

            if (code === 188) {
                character = ",";
            } //If the user presses , when the type is onkeydown
            if (code === 190) {
                character = ".";
            } //If the user presses , when the type is onkeydown

            var keys = shortcut_combination.split("+");
            //Key Pressed - counts the number of valid keypresses - if it is same as the number of keys, the shortcut function is invoked
            var kp = 0;

            //Work around for stupid Shift key bug created by using lowercase - as a result the shift+num combination was broken
            var shift_nums = {
                "`": "~",
                "1": "!",
                "2": "@",
                "3": "#",
                "4": "$",
                "5": "%",
                "6": "^",
                "7": "&",
                "8": "*",
                "9": "(",
                "0": ")",
                "-": "_",
                "=": "+",
                ";": ":",
                "'": "\"",
                ",": "<",
                ".": ">",
                "/": "?",
                "\\": "|"
            };
            //Special Keys - and their codes
            var special_keys = {
                'esc': 27,
                'escape': 27,
                'tab': 9,
                'space': 32,
                'return': 13,
                'enter': 13,
                'backspace': 8,

                'scrolllock': 145,
                'scroll_lock': 145,
                'scroll': 145,
                'capslock': 20,
                'caps_lock': 20,
                'caps': 20,
                'numlock': 144,
                'num_lock': 144,
                'num': 144,

                'pause': 19,
                'break': 19,

                'insert': 45,
                'home': 36,
                'delete': 46,
                'end': 35,

                'pageup': 33,
                'page_up': 33,
                'pu': 33,

                'pagedown': 34,
                'page_down': 34,
                'pd': 34,

                'left': 37,
                'up': 38,
                'right': 39,
                'down': 40,

                'f1': 112,
                'f2': 113,
                'f3': 114,
                'f4': 115,
                'f5': 116,
                'f6': 117,
                'f7': 118,
                'f8': 119,
                'f9': 120,
                'f10': 121,
                'f11': 122,
                'f12': 123
            };

            var modifiers = {
                shift: { wanted: false, pressed: false},
                ctrl: { wanted: false, pressed: false},
                alt: { wanted: false, pressed: false},
                meta: { wanted: false, pressed: false}    //Meta is Mac specific
            };

            if (keyEvent.ctrlKey) {
                modifiers.ctrl.pressed = true;
            }
            if (keyEvent.shiftKey) {
                modifiers.shift.pressed = true;
            }
            if (keyEvent.altKey) {
                modifiers.alt.pressed = true;
            }
            if (keyEvent.metaKey) {
                modifiers.meta.pressed = true;
            }

            var k;
            for (var i = 0; i < keys.length; i++) {
                k = keys[i];
                //Modifiers
                if (k === 'ctrl' || k === 'control') {
                    kp++;
                    modifiers.ctrl.wanted = true;

                } else if (k === 'shift') {
                    kp++;
                    modifiers.shift.wanted = true;

                } else if (k === 'alt') {
                    kp++;
                    modifiers.alt.wanted = true;
                } else if (k === 'meta') {
                    kp++;
                    modifiers.meta.wanted = true;
                } else if (k.length > 1) { //If it is a special key
                    if (special_keys[k] === code) {
                        kp++;
                    }

                } else if (opt.keycode) {
                    if (opt.keycode === code) {
                        kp++;
                    }

                } else { //The special keys did not match
                    if (character === k) {
                        kp++;
                    }
                    else {
                        if (shift_nums[character] && keyEvent.shiftKey) { //Stupid Shift key bug created by using lowercase
                            character = shift_nums[character];
                            if (character === k) {
                                kp++;
                            }
                        }
                    }
                }
            }

            if (kp === keys.length &&
                modifiers.ctrl.pressed === modifiers.ctrl.wanted &&
                modifiers.shift.pressed === modifiers.shift.wanted &&
                modifiers.alt.pressed === modifiers.alt.wanted &&
                modifiers.meta.pressed === modifiers.meta.wanted) {

                this.component.doAction(actionCommand);

                if (!opt.propagate) { //Stop the event
                    //keyEvent.cancelBubble is supported by IE - this will kill the bubbling process.
                    keyEvent.cancelBubble = true;
                    keyEvent.returnValue = false;

                    //keyEvent.stopPropagation works in Firefox.
                    if (keyEvent.stopPropagation) {
                        keyEvent.stopPropagation();
                        keyEvent.preventDefault();
                    }
                    return false;
                }
            } else {
                // Kein Treffer: Event weiter von Echo dispatchen lassen.
                return true;
            }
        };
        // Save 'this' context
        onKeyEventFunction = Core.method(this, onKeyEventFunction);

        if (!this._all_shortcuts) {
            this._all_shortcuts = {};
        }
        this._all_shortcuts[shortcut_combination] = {
            'callback': onKeyEventFunction,
            'target': ele,
            'event': opt.type
        };
        //Attach the function with the event
        Core.Web.Event.add(ele, opt.type, onKeyEventFunction, false);
        if (this._debug && window.console && window.console.log) {
            console.log('Registering event: ' + opt.type + '('
                + shortcut_combination + '->' + actionCommand + ')'
                + ' for element:' + ele + '(type: ' + typeof ele + ')');
        }
        /*if(ele.addEventListener) ele.addEventListener(opt['type'], func, false);
         else if(ele.attachEvent) ele.attachEvent('on'+opt['type'], func);
         else ele['on'+opt['type']] = func;*/
    },

    //Remove the shortcut - just specify the shortcut and I will remove the binding
    remove_shortcut: function (shortcut_combination) {
        if (this._debug && window.console && window.console.log) {
            console.log("remove_shortcut: " + shortcut_combination);
        }
        shortcut_combination = shortcut_combination.toLowerCase();
        var binding = this._all_shortcuts[shortcut_combination];
        delete(this._all_shortcuts[shortcut_combination]);
        if (!binding) {
            return;
        }
        var type = binding.event;
        var ele = binding.target;
        var callback = binding.callback;

        /*if(ele.detachEvent) ele.detachEvent('on'+type, callback);
         else if(ele.removeEventListener) ele.removeEventListener(type, callback, false);
         else ele['on'+type] = false;*/
        Core.Web.Event.remove(ele, type, callback);
    },

    /** Remove all shortcuts . */
    remove_all_shortcuts: function (shortcut_combination) {
        var keyShortcut;
        for (keyShortcut in this._all_shortcuts) {
            if (typeof this._all_shortcuts[keyShortcut] !== 'function') {
                this.remove_shortcut(keyShortcut);
            }
        }
    }


});
/**
 * ALPHA: Column alike component that hides the rendering and show a waiting message without
 * blocking the user thread: the layout container which renders its content in a single
 * vertical column of cells. May contain zero or more child components. Does not
 * support pane components as children.
 *
 * @sp {#Border} border the border displayed around the entire column
 * @sp {#Extent} cellSpacing the extent margin between cells of the column
 * @sp {#Insets} insets the inset margin between the column border and its cells
 *
 * @ldp {#Alignment} alignment the alignment of the child component within its
 *      cell
 * @ldp {#Color} background the background of the child component's cell
 * @ldp {#FillImage} backrgoundImage the background image of the child
 *      component's cell
 * @ldp {#Extent} height the height of the child component's cell
 * @ldp {#Insets} insets the insets margin of the child component's cell (this
 *      inset is added to any inset set on the container component)
 */
exxcellent.LazyBlock = Core.extend(Echo.Component, {

    $load: function () {
        Echo.ComponentFactory.registerType("exxcellent.LazyBlock", this);
    },

    /** @see Echo.Component#componentType */
    componentType: "exxcellent.LazyBlock"
});

/**
 * ALPHA: Component rendering peer: Block (Column)
 */
exxcellent.LazyBlockSync = Core.extend(Echo.Render.ComponentSync, {

    $load: function () {
        Echo.Render.registerPeer("exxcellent.LazyBlock", this);
    },

    prevFocusKey: 38,

    prevFocusFlag: Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_UP,

    nextFocusKey: 40,

    nextFocusFlag: Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_DOWN,

    /**
     * The DOM element name of child container cells.
     * @type String
     * @see Echo.Render.ComponentSync#cellElementNodeName
     */
    cellElementNodeName: "div",

    /**
     * The root DOM element of the rendered array container.
     * @type Element
     */
    element: null,
    /**
     * The root DOM element of the rendered array container.
     * @type Element
     */
    _waitElement: null,

    /**
     * The DOM element to which child elements should be added.  May be equivalent to <code>element</code>.
     * @type Element
     */
    containerElement: null,

    /**
     * Prototype Element to be cloned and added between cells of the array container.
     *
     * @type Element
     */
    spacingPrototype: null,

    /**
     * Number of pixels to be rendered as spacing between child cells of the container.
     * @type Number
     */
    cellSpacing: null,

    /**
     * Mapping between child render ids and child container cell elements.
     */
    _childIdToElementMap: null,

    /**
     * Processes a key press event.  Provides support for adjusting focus via arrow keys.
     *
     * @param e the event
     */
    processKeyPress: function (e) {
        if (!this.client) {
            return;
        }

        switch (e.keyCode) {
            case this.prevFocusKey:
            case this.nextFocusKey:
                var focusPrevious = e.keyCode == this.prevFocusKey;
                if (this.invertFocusRtl && !this.component.getRenderLayoutDirection().isLeftToRight()) {
                    focusPrevious = !focusPrevious;
                }
                var focusedComponent = this.client.application.getFocusedComponent();
                if (focusedComponent && focusedComponent.peer && focusedComponent.peer.getFocusFlags) {
                    var focusFlags = focusedComponent.peer.getFocusFlags();
                    if ((focusPrevious && focusFlags & this.prevFocusFlag) || (!focusPrevious && focusFlags & this.nextFocusFlag)) {
                        var focusChild = this.client.application.focusManager.findInParent(this.component, focusPrevious);
                        if (focusChild) {
                            this.client.application.setFocusedComponent(focusChild);
                            Core.Web.DOM.preventEventDefault(e);
                            return false;
                        }
                    }
                }
                break;
        }
        return true;
    },

    /**
     * Renders the specified child to the containerElement.
     *
     * @param {Echo.Update.ComponentUpdate} the update
     * @param {Echo.Component} the child component
     * @param {Number} index the index of the child within the parent
     */
    _renderAddChild: function (update, child, index) {
        var cellElement = document.createElement(this.cellElementNodeName);
        this._childIdToElementMap[child.renderId] = cellElement;

        // instead of Echo.Render.renderComponentAdd(update, child, cellElement);
        // we do only:
        Echo.Render._loadPeer(child.parent.peer.client, child);
        child.peer.renderAdd(update, cellElement);

        this.renderChildLayoutData(child, cellElement);

        if (index !== null && typeof index != 'undefined') {
            var currentChildCount;
            if (this.containerElement.childNodes.length >= 3 && this.cellSpacing) {
                currentChildCount = (this.containerElement.childNodes.length + 1) / 2;
            } else {
                currentChildCount = this.containerElement.childNodes.length;
            }
            if (index == currentChildCount) {
                index = null;
            }
        }
        if (index === null || typeof index == 'undefined' || !this.containerElement.firstChild) {
            // Full render, append-at-end scenario, or index 0 specified and no children rendered.

            // Render spacing cell first if index != 0 and cell spacing enabled.
            if (this.cellSpacing && this.containerElement.firstChild) {
                this.containerElement.appendChild(this.spacingPrototype.cloneNode(false));
            }

            // Render child cell second.
            this.containerElement.appendChild(cellElement);
        } else {
            // Partial render insert at arbitrary location scenario (but not at end)
            var insertionIndex = this.cellSpacing ? index * 2 : index;
            var beforeElement = this.containerElement.childNodes[insertionIndex];

            // Render child cell first.
            this.containerElement.insertBefore(cellElement, beforeElement);

            // Then render spacing cell if required.
            if (this.cellSpacing) {
                this.containerElement.insertBefore(this.spacingPrototype.cloneNode(false), beforeElement);
            }
        }
    },

    _getWaitElement: function () {
        if (!this._waitElement) {
            this._waitElement = document.createElement("div");
            this._waitElement.style.width = '200px';
            this._waitElement.style.margin = 'auto';
            this._waitElement.style.padding = '10px';

            // icon
            var waitIcon = document.createElement("div");
            var icon = this.component.render("icon");
            img = document.createElement("img");
            Echo.Sync.ImageReference.renderImg(icon, img);
            waitIcon.appendChild(img);

            // text
            var waitText = document.createElement("div");
            waitText.style.cssFloat = "right"; // all major browsers use float? no cssFloat, since float became a reserved word in js.
            waitText.style.styleFloat = "right"; // IE wants its own float var name
            var text = this.component.render("text");
            waitText.appendChild(document.createTextNode(text));

            this._waitElement.appendChild(waitText);
            this._waitElement.appendChild(waitIcon);
        }
        return this._waitElement;
    },

    /** render the busy state */
    _setBusy: function (parentNode, busyState) {
        var waitElement = this._getWaitElement();
        if (busyState) {
            parentNode.appendChild(waitElement);
        } else {
            parentNode.removeChild(waitElement);
            parentNode.appendChild(this.element);
        }
    },

    /**
     * Renders all children.  Must be invoked by derived <code>renderAdd()</code> implementations.
     *
     * @param {Echo.Update.ComponentUpdate} the update
     */
    _lazyRenderAddChildren: function (parentNode, update) {
        this._setBusy(parentNode, true);

        // Create map to contain removed components (for peer unloading).
        Echo.Render._disposedComponents = {};

        this._childIdToElementMap = {};
        var ji = 0;
        var componentCount = this.component.getComponentCount();
        var synchronBlockComponent = this;

        function doLongRunningTask() {
            if (componentCount > ji) {
                var child = synchronBlockComponent.component.getComponent(ji);
                synchronBlockComponent._renderAddChild(update, child);
                ji++;
                setTimeout(doLongRunningTask, 1);
            } else {
                finalizeRendering();
            }
        }

        function finalizeRendering() {
            synchronBlockComponent._setBusy(parentNode, false);
            Core.Web.Event.add(this.element,
                Core.Web.Env.QUIRK_IE_KEY_DOWN_EVENT_REPEAT ? "keydown" : "keypress",
                Core.method(this, this.processKeyPress), false);
        }

        // start the lazy time consuming task
        setTimeout(doLongRunningTask, 1);
    },

    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function (update) {
        Core.Web.Event.removeAll(this.element);
        this.element = null;
        this.containerElement = null;
        this._childIdToElementMap = null;
        this.spacingPrototype = null;
    },

    /**
     * Removes a child cell.
     *
     * @param {Echo.Update.ComponentUpdate} the update
     * @param {Echo.Component} the child to remove
     */
    _renderRemoveChild: function (update, child) {
        var childElement = this._childIdToElementMap[child.renderId];
        if (!childElement) {
            return;
        }

        if (this.cellSpacing) {
            // If cell spacing is enabled, remove a spacing element, either before or after the removed child.
            // In the case of a single child existing in the Row, no spacing element will be removed.
            if (childElement.previousSibling) {
                this.containerElement.removeChild(childElement.previousSibling);
            } else if (childElement.nextSibling) {
                this.containerElement.removeChild(childElement.nextSibling);
            }
        }

        this.containerElement.removeChild(childElement);

        delete this._childIdToElementMap[child.renderId];
    },

    /** @see Echo.Render.ComponentSync#renderUpdate */
    renderUpdate: function (update) {
        var i, fullRender = false;
        if (update.hasUpdatedProperties() || update.hasUpdatedLayoutDataChildren()) {
            // Full render
            fullRender = true;
        } else {
            var removedChildren = update.getRemovedChildren();
            if (removedChildren) {
                // Remove children.
                for (i = 0; i < removedChildren.length; ++i) {
                    this._renderRemoveChild(update, removedChildren[i]);
                }
            }
            var addedChildren = update.getAddedChildren();
            if (addedChildren) {
                // Add children.
                for (i = 0; i < addedChildren.length; ++i) {
                    this._renderAddChild(update, addedChildren[i], this.component.indexOf(addedChildren[i]));
                }
            }
        }
        if (fullRender) {
            var element = this.element;
            var containerElement = element.parentNode;
            Echo.Render.renderComponentDispose(update, update.parent);
            containerElement.removeChild(element);
            this.renderAdd(update, containerElement);
        }

        return fullRender;
    },

    // here once started the "column"

    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function (update, parentElement) {
        this.element = this.containerElement = document.createElement("div");
        this.element.id = this.component.renderId;
        this.element.style.outlineStyle = "none";
        this.element.tabIndex = "-1";

        Echo.Sync.renderComponentDefaults(this.component, this.element);
        Echo.Sync.Border.render(this.component.render("border"), this.element);
        Echo.Sync.Insets.render(this.component.render("insets"), this.element, "padding");

        this.cellSpacing = Echo.Sync.Extent.toPixels(this.component.render("cellSpacing"), false);
        if (this.cellSpacing) {
            this.spacingPrototype = document.createElement("div");
            this.spacingPrototype.style.height = this.cellSpacing + "px";
            this.spacingPrototype.style.fontSize = "1px";
            this.spacingPrototype.style.lineHeight = "0";
        }

        this._lazyRenderAddChildren(parentElement, update);
    },

    /** @see Echo.Sync.ArrayContainer#renderChildLayoutData */
    renderChildLayoutData: function (child, cellElement) {
        var layoutData = child.render("layoutData");
        if (layoutData) {
            Echo.Sync.Color.render(layoutData.background, cellElement, "backgroundColor");
            Echo.Sync.FillImage.render(layoutData.backgroundImage, cellElement);
            Echo.Sync.Insets.render(layoutData.insets, cellElement, "padding");
            Echo.Sync.Alignment.render(layoutData.alignment, cellElement, true, this.component);

            if (layoutData.marginLeft) {
                cellElement.style.marginLeft = layoutData.marginLeft;
            }
            if (layoutData.marginRight) {
                cellElement.style.marginRight = layoutData.marginRight;
            }
            if (layoutData.marginTop) {
                cellElement.style.marginTop = layoutData.marginTop;
            }
            if (layoutData.marginBottom) {
                cellElement.style.marginBottom = layoutData.marginBottom;
            }
            if (layoutData.width) {
                cellElement.style.width = Echo.Sync.Extent.toPixels(layoutData.width, false) + "px";
            }
            if (layoutData.height) {
                cellElement.style.height = Echo.Sync.Extent.toPixels(layoutData.height, false) + "px";
            }
            if (layoutData.floating) {
                // all major browsers use float? no cssFloat, since float became a reserved word in js.
                cellElement.style.cssFloat = layoutData.floating;
                // IE wants its own float var name
                cellElement.style.styleFloat = layoutData.floating;
            }
        }
    }
});
/**
 * LineChart Version 1.0
 * Used to draw fancy LineCharts as an Echo-Component with the help
 * of raphael and the eXXcellent Addon-Library 'exx.raphael'
 * See 'http://raphaeljs.com/' for further information
 * (This component was inspired from: http://raphaeljs.com/analytics.html)
 *
 * @author Ralf Enderle <r.enderle@exxcellent.de>
 * @version 1.0
 */

exxcellent.LineChart = Core.extend(Echo.Component, {
    $load: function () {
        Echo.ComponentFactory.registerType('exxcellent.LineChart', this);
    },
    $static: {
        DRAW_GRID: 'drawGrid',
        GRID_COLOR: 'gridColor',

        XAXIS_SECTORS: 'xaxisSectors',
        YAXIS_SECTORS: 'yaxisSectors',


        FILL_CHART: 'fillChart',
        LINE_COLOR: 'lineColor',
        DOT_COLOR: 'dotColor',
        WIDTH: 'width',
        HEIGHT: 'height',
        BACKGROUND: 'background',
        FOREGROUND: 'foreground',
        INTERPOLATION: 'interpolation',

        XSCALE_MAX: 'xscaleMax',
        YSCALE_MAX: 'yscaleMax',

        SHOW_POPUP: 'showPopup',
        POPUP_BACKGROUND: 'popupBackground',
        POPUP_BORDER_COLOR: 'popupBorderColor',
        POPUP_FOREGROUND: 'popupForeground',
        POPUP_FONT: 'popupFont',
        // - comes from JSON
        LINE_CHART_MODEL: 'lineChartModel',
        AXIS_MODEL: 'axisModel',

        // Action-data
        POINT_SELECTION: 'pointSelection'
    },
    componentType: 'exxcellent.LineChart',
    doSelectPoint: function (pointIdentifier) {
        // Notify table row select listeners.
        this.fireEvent({
            type: exxcellent.LineChart.POINT_SELECTION,
            source: this,
            data: pointIdentifier
        });
    }
});

// some DataObjects for the LineChart:
// -----------------------------

/**
 * The data object for the LineChart.
 * The only thing you HAVE to specify is 'points'
 * All other attributes will come with suitable default values.
 */
exxcellent.model.LineChartModel = Core.extend({
    /** Should this PIE be animated */
    points: null,

    $construct: function (points) {
        this.points = points;
    },

    /** Return the string representation of this PieModel. */
    toString: function () {
        return 'I am a LineChartModel';
    }
});

/**
 * DataObject for a AxisModel
 */
exxcellent.model.AxisModel = Core.extend({
    xAxisValues: null,
    yAxisValues: null,


    $construct: function (xAxisValues, yAxisValues) {
        this.xAxisValues = xAxisValues;
        this.yAxisValues = yAxisValues;
    },

    toString: function () {
        return 'AxisModel - xAxis: ' + this.xAxisValues + ' yAxis: ' + this.yAxisValues;
    }
});

/**
 * The data object for a Point
 */
exxcellent.model.Point = Core.extend({
    xValue: null,
    yValue: null,
    identifier: null,

    label: '',

    $construct: function (xValue, yValue, label, identifier) {
        this.xValue = xValue;
        this.yValue = yValue;
        this.label = label;
        this.identifier = identifier;
    },

    /** Return the string representation of this Point */
    toString: function () {
        return 'Label:' + this.label + ' xValue:' + this.xValue + ' yValue:' + this.yValue;
    }
});

/**
 * Helper-Class - is not serialized with server
 */
exxcellent.model.LineChartLayout = Core.extend({
    drawGrid: true,
    gridColor: '#000',
    xaxisSectors: 10,
    yaxisSectors: 10,
    axisFont: null,
    foreground: '#000',
    showPopup: true,
    popupBackground: '#000',
    popupBorderColor: '#666',
    popupForeground: '#fff',
    popupFont: null,
    fillChart: true,
    lineColor: '#383',
    dotColor: '#000',
    interpolation: 'bezier',
    xscaleMax: 100,
    yscaleMax: 100,
    width: 300,
    height: 200,

    $construct: function () {
        // nothing to do yet
    },

    isDrawGrid: function () {
        return this.drawGrid;
    },

    getGridColor: function () {
        return this.gridColor;
    },

    getXaxisSectors: function () {
        return this.xaxisSectors;
    },

    getYaxisSectors: function () {
        return this.yaxisSectors;
    },

    getAxisFont: function () {
        return this.axisFont;
    },

    getForeground: function () {
        return this.foreground;
    },

    isShowPopup: function () {
        return this.showPopup;
    },

    getPopupBackground: function () {
        return this.popupBackground;
    },

    getPopupBorderColor: function () {
        return this.popupBorderColor;
    },

    getPopupForeground: function () {
        return this.popupForeground;
    },

    getPopupFont: function () {
        return this.popupFont;
    },

    isFillChart: function () {
        return this.fillChart;
    },

    getLineColor: function () {
        return this.lineColor;
    },

    getDotColor: function () {
        return this.dotColor;
    },

    getInterpolation: function () {
        return this.interpolation;
    },

    getXscaleMax: function () {
        return this.xscaleMax;
    },

    getYscaleMax: function () {
        return this.yscaleMax;
    },

    getWidth: function () {
        return this.width;
    },

    getHeight: function () {
        return this.height;
    },

    toString: function () {
        return 'LineChartModel';
    }
});


/**
 * Sync.LineChart
 *
 * Component rendering peer: LineChart
 * This sync renders a LineChart to the DOM.
 *
 * @author Ralf Enderle <r.enderle@exxcellent.de>
 * @version 1.0
 */
exxcellent.LineChartSync = Core.extend(Echo.Render.ComponentSync, {
    $load: function () {
        Echo.Render.registerPeer('exxcellent.LineChart', this);
    },

    $static: {
        // tbd
    },

    // some globals
    _div: null,
    _raphael: null,

    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function (update, parentElement) {
        this._div = document.createElement("div");
        var background = this.component.render(exxcellent.LineChart.BACKGROUND);
        if (background) {
            this._div.style.background = background;
        }
        // nothing else to do yet

        parentElement.appendChild(this._div);
    },

    /** @see Echo.Render.ComponentSync#renderDisplay */
    renderDisplay: function () {
        var self = this;
        if (this._raphael) {
            // if we have already a raphael, we do nothing att all - it's just a simple refresh
            return;
        }
        var margin = 55;
        var lineChartLayout = this._getLineChartLayout();
        var lineChartModel = this._getLineChartModel();
        var axisModel = this._getAxisModel();

        // Instead of throwing an error that something is undefined, we just show nothing
        if (!lineChartModel) {
            return;
        }

        var fillChartTMP = this.component.render(exxcellent.LineChart.FILL_CHART);

        this._raphael = Raphael(this._div, lineChartLayout.getWidth() + margin, lineChartLayout.getHeight() + margin);

        var lineChart = this._raphael.exx.linechart(lineChartModel, lineChartLayout, axisModel, this._clickCallback(this));

        //this._div.style.width = this._raphael.width + 'px';
        //this._div.style.height = this._raphael.height + 'px';


    },

    /**
     * Called when the component is destroyed!
     * We clean all allocated data
     * @param update
     */
    renderDispose: function (update) {
        this._div = null;
        this._raphael = null;
    },

    /**
     * Called when an update happens.
     *
     * @param update
     */
    renderUpdate: function (update) {
        // Brut-force - just create everything new
        var element = this._div;
        this._raphael = null; // we set the Raphael to null to force a redraw
        var containerElement = element.parentNode;
        Echo.Render.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return true;
    },

    /**
     * Returns the LineChartLayout - this Objects helps to deal with Layout
     */
    _getLineChartLayout: function () {
        var lineChartLayout = new exxcellent.model.LineChartLayout();
        lineChartLayout.showPopup = this.component.render(exxcellent.LineChart.SHOW_POPUP);
        lineChartLayout.popupBackground = this.component.render(exxcellent.LineChart.POPUP_BACKGROUND);
        lineChartLayout.popupBorderColor = this.component.render(exxcellent.LineChart.POPUP_BORDER_COLOR);
        lineChartLayout.popupForeground = this.component.render(exxcellent.LineChart.POPUP_FOREGROUND);
        lineChartLayout.popupFont = this._renderFont(this.component.render(exxcellent.LineChart.POPUP_FONT));
        lineChartLayout.drawGrid = this.component.render(exxcellent.LineChart.DRAW_GRID);
        lineChartLayout.xaxisSectors = this.component.render(exxcellent.LineChart.XAXIS_SECTORS);
        lineChartLayout.yaxisSectors = this.component.render(exxcellent.LineChart.YAXIS_SECTORS);
        lineChartLayout.foreground = this.component.render(exxcellent.LineChart.FOREGROUND);
        lineChartLayout.axisFont = this._renderFont(this.component.render('font')); // comes from Echo.Component
        lineChartLayout.fillChart = this.component.render(exxcellent.LineChart.FILL_CHART);
        lineChartLayout.lineColor = this.component.render(exxcellent.LineChart.LINE_COLOR);
        lineChartLayout.dotColor = this.component.render(exxcellent.LineChart.DOT_COLOR);
        lineChartLayout.gridColor = this.component.render(exxcellent.LineChart.GRID_COLOR);
        lineChartLayout.interpolation = this.component.render(exxcellent.LineChart.INTERPOLATION);
        lineChartLayout.xscaleMax = this.component.render(exxcellent.LineChart.XSCALE_MAX);
        lineChartLayout.yscaleMax = this.component.render(exxcellent.LineChart.YSCALE_MAX);
        lineChartLayout.width = this.component.render(exxcellent.LineChart.WIDTH);
        lineChartLayout.height = this.component.render(exxcellent.LineChart.HEIGHT);
        return lineChartLayout;
    },

    /**
     * Get the LineChart-Model.
     * In case of a JSON-Object we parse it to create the exxcellent.model.PieModel
     */
    _getLineChartModel: function () {
        var value = this.component.render(exxcellent.LineChart.LINE_CHART_MODEL);
        if (value instanceof exxcellent.model.LineChartModel) {
            return value;
        } else if (value) {
            return this._fromJsonString(value).lineChartModel;
        }
    },

    /**
     * Get the Axis-Model.
     * In case of a JSON-Object we parse it to create the exxcellent.model.PieModel
     */
    _getAxisModel: function () {
        var value = this.component.render(exxcellent.LineChart.AXIS_MODEL);
        if (value instanceof exxcellent.model.AxisModel) {
            return value;
        } else if (value) {
            return this._fromJsonString(value).axisModel;
        }
    },

    /**
     * Method to parse a JSON string into an object.
     * @see "http://www.json.org/js.html"
     * @param {} json the string to be transformed into an object
     * @return {} the object
     */
    _fromJsonString: function (jsonStr) {
        return JSON.parse(jsonStr);
    },

    /**
     * Method to convert an object to a json string.
     * @see "http://www.json.org/js.html"
     * @param {} object the object to be transformed into string
     * @return {} the json string
     */
    _toJsonString: function (object) {
        return JSON.stringify(object);
    },

    /**
     * Callback - a click occured
     * @param self
     */
    _clickCallback: function (self) {
        return function () {
            self.component.doSelectPoint(this.identifier);
        };
    },

    /**
     * Renders the font to be used by the PieChart component.
     * @param font {Echo.Sync.Font} the font to render as notifier compatible font
     * @return the raphael compatible font
     */
    _renderFont: function (font) {
        if (!font) {
            return null;
        }
        var fontByEcho = {
            style: {}
        };
        Echo.Sync.Font.render(font, fontByEcho);
        var echoStyle = fontByEcho.style;

        return {
            'font': echoStyle.fontSize + ' ' + echoStyle.fontFamily,
            'font-family': echoStyle.fontFamily,
            'font-size': echoStyle.fontSize,
            'font-style': echoStyle.fontStyle
        };

    }
});
/**
 * Notification component: renders messages hovering over a given parent component
 * like a window.
 */
exxcellent.Notifier = Core.extend(Echo.Component, {

    $load: function () {
        Echo.ComponentFactory.registerType("exxcellent.Notifier", this);
    },

    /** Properties defined for this component. */
    $static: {
        ID: "id", // identifies a message
        TITLE: "title",
        TEXT: "text",
        ICON: "icon",
        POSITION: "position",
        WIDTH: "width",
        HEIGHT: "height",
        DURATION: "duration",
        STICKY: "sticky",
        FADE: "fade",
        BORDER_RADIUS: "borderRadius",
        OPACITY: 'opacity',
        HEADER_FONT: 'headerFont',
        HEADER_FOREGROUND: 'headerForeground',
        HUMANIZED: 'humanized',
        HOVER_INTERRUPT: 'hoverInterrupt',
        OVERLAYED: 'overlayed',
        BTN_SHOW: 'btnShow',
        BTN_TEXT: 'btnText',
        ACTION: 'action'
    },

    /** @see Echo.Component#componentType */
    componentType: "exxcellent.Notifier",

    /**
     * Render as floating pane in ContentPanes. If the value is 'false' the component
     * will block all other components in the contentpane.
     * @see Echo.ContentPane
     */
    floatingPane: true,

    /** @see Echo.Component#focusable */
    focusable: false,

    /**
     * Performed after the (optional) button on a message is clicked.
     * @param id the id of the notification message that was clicked.
     */
    doClickButton: function (id) {
        this.fireEvent({
            type: exxcellent.Notifier.ACTION,
            source: this,
            data: id
        });
    }
});

/**
 * Component rendering peer: Notifier.
 *
 * The component actually doesn't have any elements here but will render itself
 * as soon as the properties are filled if setting a property.
 */
exxcellent.NotifierSync = Core.extend(Echo.Render.ComponentSync, {

    $load: function () {
        Echo.Render.registerPeer("exxcellent.Notifier", this);
    },

    /** The notifier doesn't need to be initially built.*/
    renderAdd: function (update, parentElement) {
    },

    /** The notifier destroys itself. */
    renderDispose: function () {
    },

    /**
     * The notifier shall not show up on the creation - only on setting the properties.
     * This method is also triggered if the renderUpdate() is executed.
     */
    renderDisplay: function () {
    },

    /**
     * Renders the notification if the properties like text etc are set. Using
     * renderUpdate instead of renderDisplay avoids the execution on "creation".
     */
    renderUpdate: function (update) {
        // the width & height arrive as Extent e.g. '5px' or '50em' this has to be mapped to '5' (pixels)
        var width = Echo.Sync.Extent.toPixels(this.component.render(exxcellent.Notifier.WIDTH), true, true);
        var height = Echo.Sync.Extent.toPixels(this.component.render(exxcellent.Notifier.HEIGHT), false, true);
        var icon = Echo.Sync.ImageReference.getUrl(this.component.render(exxcellent.Notifier.ICON));
        var font = this.component.render("font");
        var headerFont = this.component.render(exxcellent.Notifier.HEADER_FONT);
        var text = this.component.render(exxcellent.Notifier.TEXT);
        var foreground = this.component.render('foreground');
        var headerForeground = this.component.render('headerForeground');

        var self = this;
        $('body').notifier(
            { title: this.component.render(exxcellent.Notifier.TITLE),
                text: text ? this._formatWhitespace(text) : "",
                icon: icon,
                position: this.component.render(exxcellent.Notifier.POSITION),
                width: width,
                height: height,
                padding: this.component.render("insets"),
                pFont: this._renderFont(font, foreground),
                hFont: this._renderFont(headerFont, headerForeground),
                duration: this.component.render(exxcellent.Notifier.DURATION),
                sticky: this.component.render(exxcellent.Notifier.STICKY),
                humanized: this.component.render(exxcellent.Notifier.HUMANIZED),
                hoverInterrupt: this.component.render(exxcellent.Notifier.HOVER_INTERRUPT),
                overlayed: this.component.render(exxcellent.Notifier.OVERLAYED),
                fade: this.component.render(exxcellent.Notifier.FADE),
                borderRadius: this.component.render(exxcellent.Notifier.BORDER_RADIUS),
                opacity: this.component.render(exxcellent.Notifier.OPACITY),
                background: this.component.render('background'),
                border: this.component.render('border'),
                msgId: this.component.render('id', "unknown id"),
                btnShow: this.component.render(exxcellent.Notifier.BTN_SHOW, false),
                btnText: this.component.render(exxcellent.Notifier.BTN_TEXT, "Details"),
                onBtnClick: function (id) {
                    self._onButtonClick(id);
                }
            });
    },
    /**
     * A callback if the optional button (btnShow = true) in the message is clicked.
     * @param id the message id to identify the message, whos button was clicked
     */
    _onButtonClick: function (id) {
        this.component.doClickButton(id);
    },

    /**
     * Formats the whitespace in the given text for use in HTML.
     *
     * @param text {String} the (java) text to format
     * @return the html formatted string
     */
    _formatWhitespace: function (text) {
        // switch between spaces and non-breaking spaces to preserve line wrapping
        var textStr = text.replace(/\t/g, " \u00a0 \u00a0");
        textStr = textStr.replace(/ {2}/g, " \u00a0");
        textStr = textStr.replace(/\n/g, "<br/>");
        return textStr;
    },

    /**
     * Renders the font to be used by the notifier component.
     * @param font {Echo.Sync.Font} the font to render as notifier compatible font
     * @param color {Echo.Sync.Color} the foreground color of the text used with this font
     * @return the notifier compatible font
     */
    _renderFont: function (font, color) {
        var nFont = {};
        if (font) {
            if (font.typeface) {
                if (font.typeface instanceof Array) {
                    nFont.face = font.typeface.join(",");
                } else {
                    nFont.face = font.typeface;
                }
            }

            if (font.size) {
                nFont.sizePx = Echo.Sync.Extent.toPixels(font.size, true, true);
            }
            if (font.bold) {
                nFont.weight = 'bold';
            }
        }
        if (color) {
            nFont.color = color;
        }
        return nFont;
    }
});
/**
 * PieChart Version 1.0
 * Used to draw nice PieCharts as an Echo-Component with the help
 * of raphael and g.raphael.
 * See
 * - http://raphaeljs.com/
 * - http://g.raphaeljs.com/
 * for further information
 *
 * @author Ralf Enderle  <r.enderle@exxcellent.de>
 * @version 1.0
 */
exxcellent.PieChart = Core.extend(Echo.Component, {
    $load: function () {
        Echo.ComponentFactory.registerType('exxcellent.PieChart', this);
    },

    $static: {
        PIE_MODEL: 'pieModel',

        LEGEND_FONT: 'font', // <- it is the property of 'Echo.Component'
        LEGEND_FOREGROUND: 'foreground', // <- it is the property of 'Echo.Component'
        LEGEND_POSITION: 'legendPosition',
        LEGEND_GAP_FACTOR: 'legendGapFactor',
        LEGEND_HIDE_ZERO_VALUES: 'legendHideZeroValues', // Hide zero values in legend?
        SHOW_LEGEND: 'showLegend',

        SHOW_POPUP: 'showPopUp',
        POPUP_BACKGROUND: 'popupBackground',
        POPUP_BORDER_COLOR: 'popupBorderColor',
        POPUP_FOREGROUND: 'popupForeground',
        POPUP_FONT: 'popupFont',

        DO_ANIMATION: 'doAnimation',
        ANIMATION_TYPE: 'animationType',
        ANIMATION_DURATION: 'animationDuration',

        DO_CLIENT_SORTING: 'doClientSorting',

        SECTOR_ABBREV_SHOW: 'sectorAbbrevShow', // wanna have some defined abbreviation in your sectors, toggle this to: true
        SECTOR_ABBREV_FONT: 'sectorAbbrevFont', // the font of the Abbreviation
        SECTOR_ABBREV_FOREGROUND: 'sectorAbbrevForeground', // the foreground-color of the abbreviation, every sector can define it's own if there is a need to do so

        WIDTH: 'width',
        HEIGHT: 'height',
        BACKGROUND: 'background',

        // fallback-colors - if you define no special color for a sector in the pie the next valid fallback-color will be used
        FALLBACK_SECTOR_COLOR_0: 'fallbackSectorColor_0',
        FALLBACK_SECTOR_COLOR_1: 'fallbackSectorColor_1',
        FALLBACK_SECTOR_COLOR_2: 'fallbackSectorColor_2',
        FALLBACK_SECTOR_COLOR_3: 'fallbackSectorColor_3',
        FALLBACK_SECTOR_COLOR_4: 'fallbackSectorColor_4',
        FALLBACK_SECTOR_COLOR_5: 'fallbackSectorColor_5',
        FALLBACK_SECTOR_COLOR_6: 'fallbackSectorColor_6',
        FALLBACK_SECTOR_COLOR_7: 'fallbackSectorColor_7',
        FALLBACK_SECTOR_COLOR_8: 'fallbackSectorColor_8',
        FALLBACK_SECTOR_COLOR_9: 'fallbackSectorColor_9',

        PIE_SECTOR_SELECT: 'pieSectorSelect'
    },
    componentType: 'exxcellent.PieChart',
    /** Perform when an select sector action is triggered in the PieChart. */
    doSelectPieSector: function (pieSectorSelection) {
        this.fireEvent({
            type: exxcellent.PieChart.PIE_SECTOR_SELECT,
            source: this,
            data: pieSectorSelection
        });
    }
});

// some DataObjects for the PIE:
// -----------------------------

/**
 * The data object for the PieModel.
 * The only thing you HAVE to specify is 'sectors'
 * All other attributes will come with suitable default values.
 */
exxcellent.model.PieModel = Core.extend({

    /** The sectors in this pie */
    sectors: null,

    $construct: function (sectors) {
        this.sectors = sectors;
    },

    /** Return the string representation of this PieModel. */
    toString: function () {
        return 'I am a PIE';
    }
});

/** The data object for a sector in a pie. */
exxcellent.model.PieSector = Core.extend({

    // The name of the pie
    name: null,

    // The data-value for this PieSector
    value: null,

    // The label shown on popUp
    popUpLabel: null,

    // the abbreviation
    abbreviation: null,

    // the foreground of the abbreviation
    abbreviationForeground: null,

    // Should we show the percent-Value of the sector in the legend...?
    showPercentage: false,

    // the color of this sector
    color: null,

    identifier: null,

    $construct: function (name, value, popUpLabel, showPercentage, color, abbreviation, abbreviationForeground, identifier) {
        this.name = name;
        this.value = value;
        this.popUpLabel = popUpLabel;
        if (typeof showPercentage != 'undefined') {
            this.showPercentage = showPercentage;
        }
        this.color = color;
        this.abbreviation = abbreviation;
        this.abbreviationForeground = abbreviationForeground;
        this.identifier = identifier;
    },

    /** Return the string representation of this sector. */
    toString: function () {
        return this.name;
    }
});

/**
 * PieChartSync Version 1.0
 * Component rendering peer: PieChart
 * This sync renders a PieChart to the DOM.
 *
 * @author Ralf Enderle <r.enderle@exxcellent.de>
 */
exxcellent.PieChartSync = Core.extend(Echo.Render.ComponentSync, {
    $load: function () {
        Echo.Render.registerPeer("exxcellent.PieChart", this);
    },

    $static: {
        _offsetValue: 16, // static offset to calculate spacing
        _scaleFactor: 1.1, // the scaling of the animation
        _percentageDelimiter: '-', // delimiter for percentage maybe we want to configure this via styling properties
        _minHorizontalSpaceForLegend: 100
    },

    _div: null,
    _raphael: null,

    /**
     * Add the containerDiv of the pie to the DOM
     * @param update
     * @param parentElement
     */
    renderAdd: function (update, parentElement) {
        this._div = document.createElement("div");

        // if there is a background defined
        var background = this.component.render(exxcellent.PieChart.BACKGROUND);
        if (background) {
            this._div.style.background = background;
        }

        // nothing else to do yet

        parentElement.appendChild(this._div);
    },

    /**
     * Render the pie itself to the containerDiv
     */
    renderDisplay: function () {
        var self = this;
        if (this._raphael) {
            // if we have already a raphael, we do nothing att all - it's just a simple refresh
            return;
        }

        var pieModel = this._getPieModel();
        // if there is no pie-Model defined, we just do nothing... better than creating an error inside raphael
        if (!pieModel) {
            return;
        }
        var style = this._getStyle();
        style.nextFallbackColor = function () {
            // closure for fallback-colors
            var currentCount = -1; // start at -1, we will do a ++ first in closure
            var fallbackColorArrayInner = style.fallbackColorArray;
            return function () {
                currentCount++;
                // if the next defined color in the is null, we start looping
                while (fallbackColorArrayInner[currentCount % 10] === null ||
                    typeof fallbackColorArrayInner[currentCount % 10] == 'undefined') {
                    currentCount++;
                    // we stop at 0 - makes no sensee to search any more
                    if (currentCount % 10 === 0) {
                        // if we are at position 0 and have no color, then return some kind of black
                        return fallbackColorArrayInner[currentCount % 10] || '#000';
                    }
                }
                // normally we just return the color in the array
                return fallbackColorArrayInner[currentCount % 10];
            };
        };

        var height = this.component.render(exxcellent.PieChart.HEIGHT) || 100; // <- we have some default
        var width = this.component.render(exxcellent.PieChart.WIDTH) || 100; // we have some default

        var radius = this._calculatePieRadius(width, height, style.showLegend, style.legendPosition, pieModel.sectors.length);

        var sectors = pieModel.sectors; // the various sectors of the pie

        // calculate layout-data
        var x_offset = radius + (exxcellent.PieChartSync._offsetValue * exxcellent.PieChartSync._scaleFactor);
        var y_offset = radius + (exxcellent.PieChartSync._offsetValue * exxcellent.PieChartSync._scaleFactor);

        this._raphael = Raphael(this._div, width, height);
        var raphael_self = this._raphael;


        var sectorsToPaint = []; // will contain all sectors with: value > ZERO
        var sectorsNotToPaint = [];  // will contain all sectors with: value == ZERO
        // we step through all sectors and put those with ZERO in sectorsNotToPaint
        var count;
        for (count in sectors) {
            if (sectors[count].value !== 0) {
                sectorsToPaint.push(sectors[count]);
            } else {
                sectorsNotToPaint.push(sectors[count]);
            }
        }

        // collect the legend values
        var legendValues = [];
        if (style.showLegend) {
            for (var i = 0; i < sectorsToPaint.length; i++) {
                if (sectorsToPaint[i].showPercentage) {
                    // if we should show percentage
                    legendValues[i] = '%%.%%' + exxcellent.PieChartSync._percentageDelimiter + sectorsToPaint[i].name;
                } else {
                    legendValues[i] = sectorsToPaint[i].name;
                }
            }
            for (i = 0; i < sectorsNotToPaint.length; i++) {
                if (sectorsNotToPaint[i].showPercentage) {
                    // if we should show percentage
                    legendValues.push('%%.%%' + exxcellent.PieChartSync._percentageDelimiter + sectorsNotToPaint[i].name);
                } else {
                    legendValues.push(sectorsNotToPaint[i].name);
                }
            }
        } else {
            // if we don't want to have a legend we just pass 'null' to raphael -it will handle this for us
            legendValues = null;
        }

        var pie = this._raphael.g.piechart(x_offset, y_offset, radius, sectorsToPaint, sectorsNotToPaint, {legend: legendValues, legendpos: style.legendPosition, legendcolor: style.legendForeground}, style);

        // if animation is defined we inject a callback into raphael
        if (style.doAnimation) {
            // Let's do some animation
            pie.hover(
                // on 'mouseover'-callback
                function () {
                    this.sector.stop();
                    this.sector.scale(exxcellent.PieChartSync._scaleFactor, exxcellent.PieChartSync._scaleFactor, this.cx, this.cy);
                    // - popUp section
                    if (style.showPopUp) {
                        var popupTextFill = {fill: style.popupForeground};
                        var popUpFont = style.popupFont;
                        this.popUpLabel = raphael_self.text(0, 0, this.sector.value.popUpLabel).attr(popupTextFill).attr(popUpFont);
                        // if the sector is over middle, we open the PopUp zto bottom, if the sector is under the middle, we open the PopUp to top
                        var direction = 'top'; // default
                        if (this.cy > this.my) {
                            // if we are over middle, we open to bottom
                            direction = 'bottom';
                        }
                        this.popUp = raphael_self.popup(this.mx, this.my, this.popUpLabel, direction).attr({fill: style.popupBackground, stroke: style.popupBorderColor, "stroke-width": 2, "fill-opacity": 0.7});
                    }
                    // - label section, animate, if we have one
                    if (this.label) {
                        this.label[0].stop();
                        this.label[0].scale(1.5);
                        this.label[1].attr({"font-weight": 800});
                    }
                },
                // on 'mouseout'-callback
                function () {
                    // hide popUp
                    if (style.showPopUp) {
                        this.popUpLabel.hide();
                        this.popUp.hide();
                    }
                    // animate sector to default
                    this.sector.animate({scale: [1, 1, this.cx, this.cy]}, style.animationDuration, style.animationType);
                    // if we have a legend, set do default
                    if (this.label) {
                        this.label[0].animate({scale: 1}, style.animationDuration, style.animationType);
                        this.label[1].attr({"font-weight": 400});
                    }
                });
        }

        // eventHandler...
        pie.click(function () {
            var _sectorValue = this.sector.value;

            self._onSelectPieSector(_sectorValue.identifier);
        });

        //this._div.style.width = this._raphael.width + 'px';
        //this._div.style.height = this._raphael.height + 'px';


    },

    /**
     * Called when the component is destroyed!
     * We clean all allocated data
     * @param update
     */
    renderDispose: function (update) {
        this._div = null;
        this._raphael = null;
    },

    /**
     * Called when an update happens.
     *
     * @param update
     */
    renderUpdate: function (update) {
        // Brut-force - just create everything new
        var element = this._div;
        this._raphael = null; // we set the Raphael to null to force a redraw
        var containerElement = element.parentNode;
        Echo.Render.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return true;
    },

    /**
     * Get the PIE-Model.
     * In case of a JSON-Object we parse it to create the exxcellent.model.PieModel
     */
    _getPieModel: function () {
        var value = this.component.render(exxcellent.PieChart.PIE_MODEL);
        if (value instanceof exxcellent.model.PieModel) {
            return value;
        } else if (value) {
            return this._fromJsonString(value).pieModel;
        }
    },

    /**
     * Returns the style of the Pie
     */
    _getStyle: function () {
        var style = {
            legendFont: this._renderFont(this.component.render(exxcellent.PieChart.LEGEND_FONT)),
            legendForeground: this.component.render(exxcellent.PieChart.LEGEND_FOREGROUND),
            legendHideZeroValues: this.component.render(exxcellent.PieChart.LEGEND_HIDE_ZERO_VALUES) || false,
            legendPosition: this.component.render(exxcellent.PieChart.LEGEND_POSITION) || 'east',
            legendGapFactor: this.component.render(exxcellent.PieChart.LEGEND_GAP_FACTOR) || 1.2,
            showLegend: this.component.render(exxcellent.PieChart.SHOW_LEGEND),
            doAnimation: this.component.render(exxcellent.PieChart.DO_ANIMATION),
            animationType: this.component.render(exxcellent.PieChart.ANIMATION_TYPE) || 'bounce',
            animationDuration: this.component.render(exxcellent.PieChart.ANIMATION_DURATION) || 900,
            doClientSorting: this.component.render(exxcellent.PieChart.DO_CLIENT_SORTING) || false, // default - no client sorting!
            showPopUp: this.component.render(exxcellent.PieChart.SHOW_POPUP),
            popupBackground: this.component.render(exxcellent.PieChart.POPUP_BACKGROUND) || '#000',
            popupBorderColor: this.component.render(exxcellent.PieChart.POPUP_BORDER_COLOR) || '#666',
            popupForeground: this.component.render(exxcellent.PieChart.POPUP_FOREGROUND) || '#fff',
            popupFont: this._renderFont(this.component.render(exxcellent.PieChart.POPUP_FONT)) || {font: '10px Helvetica, Arial'},
            sectorAbbrevShow: this.component.render(exxcellent.PieChart.SECTOR_ABBREV_SHOW) || false, // default is false -> no abbreviation in the sectors
            sectorAbbrevFont: this._renderFont(this.component.render(exxcellent.PieChart.SECTOR_ABBREV_FONT)) || {font: '10px Helvetica, Arial'},
            sectorAbbrevForeground: this.component.render(exxcellent.PieChart.SECTOR_ABBREV_FOREGROUND) || '#000',

            fallbackColorArray: [
                this.component.render(exxcellent.PieChart.FALLBACK_SECTOR_COLOR_0) || null,
                this.component.render(exxcellent.PieChart.FALLBACK_SECTOR_COLOR_1) || null,
                this.component.render(exxcellent.PieChart.FALLBACK_SECTOR_COLOR_2) || null,
                this.component.render(exxcellent.PieChart.FALLBACK_SECTOR_COLOR_3) || null,
                this.component.render(exxcellent.PieChart.FALLBACK_SECTOR_COLOR_4) || null,
                this.component.render(exxcellent.PieChart.FALLBACK_SECTOR_COLOR_5) || null,
                this.component.render(exxcellent.PieChart.FALLBACK_SECTOR_COLOR_6) || null,
                this.component.render(exxcellent.PieChart.FALLBACK_SECTOR_COLOR_7) || null,
                this.component.render(exxcellent.PieChart.FALLBACK_SECTOR_COLOR_8) || null,
                this.component.render(exxcellent.PieChart.FALLBACK_SECTOR_COLOR_9) || null
            ]
        };
        return style;
    },

    /**
     * Calculate PieRadius
     * @param width
     * @param height
     * @param showLegend
     * @param legendPos
     * @param amountOfSectors
     *
     * @return pieRadius
     */
    _calculatePieRadius: function (width, height, showLegend, legendPos, amountOfSectors) {
        var radius = 0;
        // if we have a legend
        if (showLegend) {
            if (legendPos === 'east' || legendPos === 'west') {
                radius = height / 2;
                //var correctionByWidth = (width - exxcellent.PieChartSync._minHorizontalSpaceForLegend) / 2; // May there is not enough space for it...
                //radius = Math.min(radius, correctionByWidth) - (exxcellent.PieChartSync._offsetValue * exxcellent.PieChartSync._scaleFactor);
                radius = radius - (exxcellent.PieChartSync._offsetValue * exxcellent.PieChartSync._scaleFactor);
            }

            if (legendPos === 'north' || legendPos === 'south') {
                radius = width / 2;
                //var correctionByHeight = (height - (15 * amountOfSectors)) / 2;
                //radius = Math.min(radius, correctionByHeight) - (exxcellent.PieChartSync._offsetValue * exxcellent.PieChartSync._scaleFactor);
                radius = radius - (exxcellent.PieChartSync._offsetValue * exxcellent.PieChartSync._scaleFactor);
            }
        } else {
            // if we don't have a legend, it's easy
            radius = Math.min(height / 2, width / 2) - (exxcellent.PieChartSync._offsetValue * exxcellent.PieChartSync._scaleFactor);
        }

        // just a little fallback, we don't want to have a pie with radius < 10
        if (radius < 10) {
            return 10;
        }
        // default:
        return radius;
    },

    /**
     * Method to process the event on selecting a cell.
     * Used JSON format :
     * {"rowSelection": {
     *      "sectorIdId": 1
     *      "sectorName": Foo
     * }}
     * @param {Number} sectorId - the internal RaphaelID of the selected Sector
     * @param {String} sectorName - the name of the selected Sector
     * @param {Number} sectorValue - the value of the sector
     */
    _onSelectPieSector: function (identifier) {
        this.component.doSelectPieSector(identifier);
        return false;
    },

    /**
     * Method to parse a JSON string into an object.
     * @see "http://www.json.org/js.html"
     * @param {} json the string to be transformed into an object
     * @return {} the object
     */
    _fromJsonString: function (jsonStr) {
        return JSON.parse(jsonStr);
    },

    /**
     * Method to convert an object to a json string.
     * @see "http://www.json.org/js.html"
     * @param {} object the object to be transformed into string
     * @return {} the json string
     */
    _toJsonString: function (object) {
        return JSON.stringify(object);
    },

    /**
     * Renders the font to be used by the PieChart component.
     * @param font {Echo.Sync.Font} the font to render as notifier compatible font
     * @return the raphael compatible font
     */
    _renderFont: function (font) {
        if (!font) {
            return null;
        }
        var fontByEcho = {
            style: {}
        };
        Echo.Sync.Font.render(font, fontByEcho);
        var echoStyle = fontByEcho.style;

        return {
            'font': echoStyle.fontSize + ' ' + echoStyle.fontFamily,
            'font-family': echoStyle.fontFamily,
            'font-size': echoStyle.fontSize,
            'font-style': echoStyle.fontStyle
        };

    }
});
/**
 * PlainHtml Version 1.0
 * Used to display different Plain html on a div.
 * You could put a static html-Document on this component or even a video within an iframe
 *
 * @author Ralf Enderle <r.enderle@exxcellent.de>
 * @version 1.0
 */
exxcellent.PlainHtml = Core.extend(Echo.Component, {
    $load: function () {
        Echo.ComponentFactory.registerType('exxcellent.PlainHtml', this);
    },

    $static: {
        HTML_TEXT: 'htmlText'
    },
    componentType: 'exxcellent.PlainHtml'
});

/**
 * Sync.PlainHtml
 *
 * PlainHtmlSync Version 1.0
 * Component rendering peer: PlainHtml
 * This sync renders plain xHTML
 *
 * @author Ralf Enderle <r.enderle@exxcellent.de>
 * @version 1.0
 */
exxcellent.PlainHtmlSync = Core.extend(Echo.Render.ComponentSync, {
    $load: function () {
        Echo.Render.registerPeer("exxcellent.PlainHtml", this);
    },

    _parentElement: null,

    /**
     * Add the containerDiv of the pie to the DOM
     * @param update
     * @param parentElement
     */
    renderAdd: function (update, parentElement) {
        if (!this._parentElement) {
            this._parentElement = parentElement;
        }
    },

    /** @see Echo.Render.ComponentSync#renderDisplay */
    renderDisplay: function () {
        var value = this.component.render(exxcellent.PlainHtml.HTML_TEXT);
        // only if there is something to set - we don't want to display 'undefined' on screen :-)
        if (value) {
            this._parentElement.innerHTML = value;
        }
    },

    /**
     * Called when the component is destroyed!
     * We clean all allocated data
     * @param update
     */
    renderDispose: function (update) {
        if (this._parentElement) {
            this._parentElement.innerHTML = "";
        }
        this._parentElement = null;
    },

    /**
     * Called when an update happens.
     *
     * @param update
     */
    renderUpdate: function (update) {
        // we just force a renderAdd
        this.renderAdd();
        return true;
    }
});
/**
 * SuggestField
 * Component to show a suggestField with the possibility of a serverFilter
 * Makes use of an extended jQuerUI autocomplete PlugIn jQuery.ui.autocomplete
 * @author Ralf Enderle <r.enderle@exxcellent.de>
 * @version 1.0
 */
exxcellent.SuggestField = Core.extend(Echo.TextComponent, {

    $load: function () {
        Echo.ComponentFactory.registerType("exxcellent.SuggestField", this);
    },

    $static: {
        //SUGGEST_CONFIG: 'suggestConfig',
        SUGGEST_MODEL: 'suggestModel',
        DO_SERVER_FILTER: 'doServerFilter',

        // SUGGEST_CONFIG
        MIN_LENGTH: 'minLength',
        DELAY: 'delay',
        DISABLED: 'disabled',
        SHOW_DESCRIPTION: 'showDescription',
        SHOW_CATEGORY: 'showCategory',
        GROW_LEFT: 'growLeft',

        // Styling
        MAGNIFIER_IMG: 'magnifierImg',
        LOADING_IMG: 'loadingImg',
        SUGGEST_FONT: 'suggestFont',
        SUGGEST_FOREGROUND: 'suggestForeground',
        DESCRIPTION_FONT: 'descriptionFont',
        DESCRIPTION_FOREGROUND: 'descriptionForeground',
        SUGGEST_AREA_COLOR: 'suggestAreaColor',
        SUGGEST_AREA_HOVER: 'suggestAreaHover',

        TRIGGER_SERVER_FILTER: 'async_triggerServerFilter', // async-Method
        SUGGEST_ITEM_SELECTED: 'suggestItemSelected'
    },

    /** @see Echo.Component#componentType */
    componentType: "exxcellent.SuggestField",

    doTriggerServerFilter: function (inputData) {
        this.fireEvent({
            type: exxcellent.SuggestField.TRIGGER_SERVER_FILTER,
            source: this,
            data: inputData
        });
    },

    doFireSuggestItemSelected: function (inputData) {
        this.fireEvent({
            type: exxcellent.SuggestField.SUGGEST_ITEM_SELECTED,
            source: this,
            data: inputData
        });
    }


});

/**
 * DataObject for a suggestConfig
 */
exxcellent.config.SuggestConfig = Core.extend({
    minLength: 1,
    delay: 300,
    disabled: false,
    doServerFilter: false,
    showDescription: false,
    showCategory: false,
    growLeft: false,

    $construct: function () {
    },

    /** Return the string representation of this PieModel. */
    toString: function () {
        return '[SuggestConfig] - minLength: ' + this.minLength + ' delay: ' + this.delay +
            ' disabled: ' + this.disabled + ' serverFilter: ' + this.doServerFilter +
            ' showDescription: ' + this.showDescription + ' showCategory: ' + this.showCategory + ' growLeft' + this.growLeft;
    }
});

/**
 * DataObject for a SuggestModel
 */
exxcellent.model.SuggestModel = Core.extend({
    suggestItems: null,

    $construct: function (suggestItems) {
        this.suggestItems = suggestItems;
    },

    /** Return the string representation of this PieModel. */
    toString: function () {
        return '[SuggestModel] - Items: ' + this.suggestItems;
    }
});

/**
 * DataObject for a SuggestItem
 */
exxcellent.model.SuggestItem = Core.extend({
    label: null,
    description: null,
    category: null,
    idnetifier: null,


    $construct: function (label, description, category, identifier) {
        this.label = label;
        this.description = description;
        this.category = category;
        this.identifier = identifier;
    },

    /** Return the string representation of this PieModel. */
    toString: function () {
        return '[SuggestItem] - Label: ' + this.label + ' Description: ' + this.description + ' Category: ' + this.category + ' Identifier: ' + this.identifier;
    }
});

/**
 * Sync.SuggestField
 * Synchronisation component for Sync.SuggestField.js
 *
 * Makes use of an extended jQuerUI autocomplete PlugIn jQuery.ui.autocomplete
 * @author Ralf Enderle <r.enderle@exxcellent.de>
 * @version 1.0
 */
exxcellent.SuggestFieldSync = Core.extend(Echo.Sync.TextComponent, {

    $load: function () {
        Echo.Render.registerPeer("exxcellent.SuggestField", this);
    },

    $virtual: {

        /**
         * Input element type, either "text" or "password"
         * @type String
         */
        _type: "text"
    },

    _number: 1,
    _lastInput: null,
    _obsoleteInput: null,
    _isValidSuggestUpdate: null, // marker, if we have a valid update - if false, updateEvents will not be processed

    /** @see Echo.Render.ComponentSync#getFocusFlags */
    getFocusFlags: function () {
        //return Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_UP | Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_DOWN;
    },

    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function (update, parentElement) {
        // first of all, we create the input-field
        this.input = document.createElement("input");


        this.input.id = this.component.renderId;
        if (!this.component.render("editable", true)) {
            this.input.readOnly = true;
        }
        this.input.type = this._type;
        var maximumLength = this.component.render("maximumLength", -1);
        if (maximumLength >= 0) {
            this.input.maxLength = maximumLength;
        }
        this._renderStyle(this.input);
        this._addEventHandlers(this.input);
        if (this.component.get("text")) {
            this.input.value = this.component.get("text");
        }
        if (this._lastInput) {
            this.input.value = this._lastInput;
        }

        // set obsoleteInput to actual
        this._obsoleteInput = this.input.value;

        // no jQuery is going to play with us :-)
        var _id = this.input;
        var self = this;
        var suggestConfig = this._getSuggestConfig();
        var orientation = {};
        if (suggestConfig.growLeft) {
            orientation.my = "right top"; //  <- force to grow from right to left :-)
            orientation.at = "right bottom";
            orientation.collision = "none";
            orientation.offset = "0 0";
            orientation.of = $(this.input);
        } else {
            orientation.my = "left top"; // <- force to grow from left to right this is default
            orientation.at = "left bottom";
            orientation.collision = "none";
            orientation.offset = "0 0";

        }
        $(_id).autocomplete(
            {
                disabled: suggestConfig.disabled,          // are we disabled...?
                delay: suggestConfig.delay,                // the delay - how long do we wait before triggering a search (is only for none-Serverfilter)
                position: orientation,                      // specify, how the suggestBox should grow and where to start
                minLength: suggestConfig.minLength,          // the minimum length of input, before we trigger a search
                source: function (request, response) {       // this function is a hook to collect the suggestData
                    response(self._getData());
                },
                styling: this._getUserDefinedStyle(),       // the style of the autocomplete
                doServerFilter: suggestConfig.doServerFilter, // property to indicate, if we have a server filter
                select: function (event, ui) {
                    self._suggestSelectCallback(ui.item);
                    self.input.value = ui.item.value;
                    return false;
                }
            }).data("autocomplete")._renderItem = function (ul, item) {
            return self._getRenderItem(ul, item, this.term, this);  // <- call our own implementation
        };

        // finally we add a keyUp handler to the input-field
        Core.Web.Event.add(this.input, "keyup",
            Core.method(this, this._processKeyUpInternal), false);
        // and a keydown for consuming ESC

        this.renderAddToParent(parentElement);
        Core.Web.Event.add(this.input, "keydown",
            Core.method(this, this._processKeyDownInternal), false);
    },

    /**
     * Called when an update occurs
     * @param update
     */
    renderUpdate: function (update) {
        var id = this.input;
        if (update.getUpdatedProperty(exxcellent.SuggestField.SUGGEST_MODEL)) {
            if (this._isValidSuggestUpdate) {
                $(id).autocomplete('search', id.value);
                $(id).autocomplete('setLoadingAnimation', false);
                var length = 0;
                if (this._obsoleteInput && id.value) {
                    length = id.value.length - this._obsoleteInput.length;
                }
                var i = 0;
                for (i = 0; i <= length + 1; i++) {
                    // we repos the suggestBox n-times. jQuery is not a friend if asynchronous Echo calls like we do here
                    $(id).autocomplete('repos');
                }
                this._obsoleteInput = id.value;
                this._isValidSuggestUpdate = false;

            }
            return;
        } else {
            // if any other property changed, we call super.renderUpdate
            Echo.Sync.TextComponent.prototype.renderUpdate.call(this, update);
        }
    },
    /**
     * Destroy the component
     * @param update
     */
    renderDispose: function (update) {
        $(this.input).autocomplete('destroy');
        // call super
        Echo.Sync.TextField.prototype.renderDispose.call(this, update);
    },

    /**
     * Callback to retrieve data
     */
    _getData: function () {
        var availableTags = this._getSuggestModel().suggestItems;
        return availableTags;
    },

    /**
     * Returns the defined style - this will be merged will the default style of the jQuery UI autocomplete component
     */
    _getUserDefinedStyle: function () {
        var style = {
            magnifier_img: Echo.Sync.ImageReference.getUrl(this.component.render(exxcellent.SuggestField.MAGNIFIER_IMG)),
            loading_img: Echo.Sync.ImageReference.getUrl(this.component.render(exxcellent.SuggestField.LOADING_IMG)),
            suggestFont: this.component.render(exxcellent.SuggestField.SUGGEST_FONT),
            suggestForeground: this.component.render(exxcellent.SuggestField.SUGGEST_FOREGROUND),
            descriptionFont: this.component.render(exxcellent.SuggestField.DESCRIPTION_FONT),
            descriptionForeground: this.component.render(exxcellent.SuggestField.DESCRIPTION_FOREGROUND),
            suggestAreaColor: this.component.render(exxcellent.SuggestField.SUGGEST_AREA_COLOR),
            suggestAreaHover: this.component.render(exxcellent.SuggestField.SUGGEST_AREA_HOVER)
        };

        return style;
    },

    /**
     * Get the item that will be rendered in the suggestBox
     * @param ul
     * @param item
     * @param term - the term the user has written to the textField
     * @param that - the jQuery Object
     */
    _getRenderItem: function (ul, item, term, that) {
        // RegExp-Voodoo: replace the userInput in with a bold character
        var t = item.label.replace(
            new RegExp(
                "(?![^&;]+;)(?!<[^<>]*)(" +
                    $.ui.autocomplete.escapeRegex(term) +
                    ")(?![^<>]*>)(?![^&;]+;)", "gi"
            ), "<strong>$1</strong>");

        // now we first get the styling for the main-Text
        var mainStyle = this._getFontAsStyle(that.styling.suggestFont, that.styling.suggestForeground);
        var labelText = '' +
            '<a>' + // <- we open a section the we call 'a' ******************************
            '<span ' + mainStyle + '>' +
            t + // <- this is our text
            '</span>';

        var suggestConfig = this._getSuggestConfig();
        if (suggestConfig.showDescription) {
            // if we have to show a description, we get the stylung for description
            var descrStyle = this._getFontAsStyle(that.styling.descriptionFont, that.styling.descriptionForeground);
            labelText = labelText +
                '<br>' + // <- a new line
                '<span ' + descrStyle + '>' + // <- the styling
                ((item.description) ? item.description : '-') + // <- the description itself
                '</span>';
        }
        labelText = labelText + '</a>'; // <- finally we close the whole section ****************

        return $("<li></li>")
            .data("item.autocomplete", item)
            .append(labelText)
            .appendTo(ul);
    },

    /**
     * Returns the font and color as String for styling
     * @param font
     * @param color
     */
    _getFontAsStyle: function (font, color) {
        if (!font) {
            return '';
        }
        var style = 'style = "' +
            ' font-family:' + (font.typeface instanceof Array ? '\'' + font.typeface.join('\', \'') + '\'' : ('\'' + font.typeface + '\'')) + ';' + // <- if it is an array, we have to split
            ' font-size:' + font.size + ';' +
            ' font-style:' + ((font.italic) ? 'italic' : 'normal') + ';' +
            ' font-weight:' + ((font.bold) ? 'bold' : 'normal') + ';' +
            ' text-decoration:' + ((font.underline) ? 'underline' : ((font.overline) ? 'overline' : ((font.lineThrough) ? 'line-through' : 'normal'))) + ';' +
            ' color:' + ((color) ? color : '#000000') +
            '" ';
        return style;
    },

    /**
     * Do not use anymore!
     * @param ul
     * @param item
     *
     * @deprecated
     */
    _getRenderItem_OLD: function (ul, item) {
        var suggestConfig = this._getSuggestConfig();
        var labelText = '<a>' + item.label;
        if (suggestConfig.showDescription) {
            labelText = labelText + '<br>' + '<i>' + item.description + '</i>';
        }
        labelText = labelText + '</a>';
        return $("<li></li>")
            .data("item.autocomplete", item)
            .append(labelText)
            .appendTo(ul);
    },

    /**
     * Allows all input.
     * @see Echo.Sync.TextComponent#sanitizeInput
     */
    sanitizeInput: function () {
        // allow all input
    },

    /**
     * Callback for a selection of a suggestItem
     * @param suggestItem
     */
    _suggestSelectCallback: function (suggestItem) {
        // force a setText and then call the super.clientKeyUp - we want to make sure, that the input is in sync with the component
        this.component.set("text", suggestItem.label, true);
        if (this.component.get("text")) {
            this.input.value = this.component.get("text");
        }
//        this._storeSelection();
        Echo.Sync.TextComponent.prototype.clientKeyUp.call(this);

        // now fire the SuggestItemSelected...:
        this.component.doFireSuggestItemSelected(suggestItem.identifier);
    },

    /**
     * Processes a KeyUp-Event
     * @param e
     */
    _processKeyUpInternal: function (e) {
        // we call the super.clientKeyUp - we want to make sure, that the input is in sync with the component
        Echo.Sync.TextComponent.prototype.clientKeyUp.call(this, e);
        var inField = this.input;
        var self = this;

        this._lastInput = inField.value;
        // if there is no serverFilter, we can return - jQuery will handle keyEvents for us :-)
        var suggestConfig = this._getSuggestConfig();
        if (!suggestConfig.doServerFilter) {
            return;
        }

        // if we have a server filter have some own implemetation on keyEvents because of the asynchronous behaviour
        var keyCode = $.ui.keyCode;
        switch (e.keyCode) {
            case keyCode.ENTER:
            case keyCode.NUMPAD_ENTER:
                clearTimeout(inField.searching);
                this._isValidSuggestUpdate = false;
                $(inField).autocomplete('setLoadingAnimation', false);
                $(inField).autocomplete('close');
                return true;
            case keyCode.PAGE_UP:
            case keyCode.PAGE_DOWN:
            case keyCode.UP:
            case keyCode.DOWN:
            case keyCode.TAB:
                // do nothing here - navigation is handled by jQuery
                break;
            case keyCode.ESCAPE:
                clearTimeout(inField.searching);
                $(inField).autocomplete('close');
                Core.Web.DOM.stopEventPropagation(e);
                break;
            default:
                // we start searching
                var defMinLength = suggestConfig.minLength;
                var currentLength = this.input.value.length;
                if (currentLength >= defMinLength) {
                    clearTimeout(self.searching);
                    this._isValidSuggestUpdate = true;
                    self.searching = setTimeout(function () {
                        self._triggerServerFilter();
                    }, 500);
                }
        }


    },

    /**
     * Processes KeyDown-Events from suggestField
     * @param e
     */
    _processKeyDownInternal: function (e) {
        var inField = this.input;
        var keyCode = $.ui.keyCode;
        switch (e.keyCode) {
            // Just in case of ESCAPE
            case keyCode.ESCAPE:
                if (!$(inField).autocomplete('isSuggestBoxVisible')) {
                    // if SuggestBox is not visible, we do not consume the event - maybe another GUI-Element will then react on it
                    // e.g. the active WorkingPanel could be closed by ESCAPE etc.
                    return true;
                }
                // but if the box is visible, the ESCAPE is OUR event - close suggest!
                clearTimeout(inField.searching);
                $(inField).autocomplete('close');
                Core.Web.DOM.stopEventPropagation(e);  // <- stop propagating, we don´t want others to inform about ESCAPE in this case
                break;
            // Handle ENTER and NUMPAD_ENTER -> do not consume it here, maybe there is another ActionListener, that will be informed
            case keyCode.ENTER:
            case keyCode.NUMPAD_ENTER:
                clearTimeout(inField.searching);
                this._isValidSuggestUpdate = false;
                $(inField).autocomplete('setLoadingAnimation', false);
                $(inField).autocomplete('close');
                // so we throw it back with true -> echo will look for other listeners for us
                return true;
        }


    },

    /**
     * will be triggered after a certain of time
     */
    _triggerServerFilter: function () {
        if (this._isValidSuggestUpdate) {
            var inField = this.input;
            $(inField).autocomplete('setLoadingAnimation', true);
            this.component.doTriggerServerFilter(inField.value);
        }
    },

    /**
     * Returns the config for the suggestField
     */
    _getSuggestConfig: function () {
        // we have some defaultValues
        var suggestConfig = new exxcellent.config.SuggestConfig();
        suggestConfig.minLength = this.component.render(exxcellent.SuggestField.MIN_LENGTH) || 1;
        suggestConfig.delay = this.component.render(exxcellent.SuggestField.DELAY) || 300;
        suggestConfig.disabled = this.component.render(exxcellent.SuggestField.DISABLED) || false;
        suggestConfig.doServerFilter = this.component.render(exxcellent.SuggestField.DO_SERVER_FILTER) || false;
        suggestConfig.showDescription = this.component.render(exxcellent.SuggestField.SHOW_DESCRIPTION) || false;
        suggestConfig.showCategory = this.component.render(exxcellent.SuggestField.SHOW_CATEGORY) || false;
        suggestConfig.growLeft = this.component.render(exxcellent.SuggestField.GROW_LEFT) || false;
        return suggestConfig;
    },
    /**
     * Get the Suggest-Model.
     * In case of a JSON-Object we parse it to create the exxcellent.model.SuggestModel
     */
    _getSuggestModel: function () {
        var value = this.component.render(exxcellent.SuggestField.SUGGEST_MODEL);
        if (value instanceof exxcellent.model.SuggestModel) {
            return value;
        } else if (value) {
            return this._fromJsonString(value).suggestModel;
        }
    },

    /**
     * Method to parse a JSON string into an object.
     * @see "http://www.json.org/js.html"
     * @param {} json the string to be transformed into an object
     * @return {} the object
     */
    _fromJsonString: function (jsonStr) {
        return JSON.parse(jsonStr);
    },

    /**
     * Method to convert an object to a json string.
     * @see "http://www.json.org/js.html"
     * @param {} object the object to be transformed into string
     * @return {} the json string
     */
    _toJsonString: function (object) {
        return JSON.stringify(object);
    }
});

