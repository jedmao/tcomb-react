/* global describe,it */
'use strict';
var assert = require('assert');
var throwsWithMessage = function (f, message) {
  assert.throws(f, function (err) {
    assert.ok(err instanceof Error);
    assert.strictEqual(err.message, message);
    return true;
  });
};
var doesNotThrow = assert.doesNotThrow;
var React = require('react');
var t = require('tcomb-validation');
var library = require('../index');
var getPropTypes = library.propTypes;
var ReactElement = library.ReactElement;
var ReactNode = library.ReactNode;

var runPropTypes = function (propTypes, props) {
  for (var prop in propTypes) {
    propTypes[prop](props, prop, '<diplayName>');
  }
};

describe('exports', function () {

  it('should export tcomb', function () {
    assert.ok(library.t === t);
  });

  it('should export propTypes function', function () {
    assert.ok(typeof getPropTypes === 'function');
  });

  it('should export the es7 decorator', function () {
    assert.ok(typeof library.props === 'function');
  });

  it('should export ReactElement type', function () {
    assert.ok(ReactElement.meta.kind === 'irreducible');
  });

  it('should export ReactNode type', function () {
    assert.ok(ReactNode.meta.kind === 'irreducible');
  });

});

describe('propTypes', function () {

  it('should check bad values', function () {
    var T = t.struct({name: t.Str});
    var propTypes = getPropTypes(T);
    assert.ok(typeof propTypes === 'object');
    assert.deepEqual(Object.keys(propTypes), ['name', '__strict__']);
    throwsWithMessage(function () {
      runPropTypes(propTypes, {});
    }, '[tcomb] Invalid prop "name" supplied to <diplayName>, should be a String.\n\nDetected errors (1):\n\n 1. Invalid value undefined supplied to String\n\n');
    doesNotThrow(function () {
      runPropTypes(propTypes, {name: 'a'});
    });
  });

  it('should accept a hash of props instead of a struct', function () {
    var propTypes = getPropTypes({name: t.Str});
    throwsWithMessage(function () {
      runPropTypes(propTypes, {});
    }, '[tcomb] Invalid prop "name" supplied to <diplayName>, should be a String.\n\nDetected errors (1):\n\n 1. Invalid value undefined supplied to String\n\n');
    doesNotThrow(function () {
      runPropTypes(propTypes, {name: 'a'});
    });
    doesNotThrow(function() {
      runPropTypes(propTypes, {name: 'a', __strict__: void 0, __subtype__: void 0});
    });
  });

  it('should check a subtype', function () {
    var T = t.subtype(t.struct({name: t.Str}), function startsWithA(x) {
      return x.name.indexOf('a') === 0;
    });
    var propTypes = getPropTypes(T);
    throwsWithMessage(function () {
      runPropTypes(propTypes, {name: 'b'});
    }, '[tcomb] Invalid props:\n\n{\n  \"name\": \"b\"\n}\n\nsupplied to <diplayName>, should be a {{name: String} | startsWithA} subtype.');
    doesNotThrow(function () {
      runPropTypes(propTypes, {name: 'a'});
    });
  });

  it('should check additional props', function () {
    var propTypes = getPropTypes({name: t.Str});
    throwsWithMessage(function () {
      runPropTypes(propTypes, {name: 'a', surname: 'b'});
    }, '[tcomb] Invalid additional prop(s):\n\n[\n  "surname"\n]\n\nsupplied to <diplayName>.');
  });

  it('should allow to opt-out the additional props check', function () {
    var propTypes = getPropTypes({name: t.Str}, { strict: false });
    doesNotThrow(function () {
      runPropTypes(propTypes, {name: 'a', surname: 'b'});
    });
  });

});

describe('pre-defined types', function () {

  it('should check ReactElement(s)', function () {
    var propTypes = getPropTypes({el: ReactElement});
    throwsWithMessage(function () {
      runPropTypes(propTypes, {el: 'a'});
    }, '[tcomb] Invalid prop \"el\" supplied to <diplayName>, should be a ReactElement.\n\nDetected errors (1):\n\n 1. Invalid value "a" supplied to ReactElement\n\n');
    doesNotThrow(function () {
      runPropTypes(propTypes, {el: React.createElement('div')});
    });
  });

  it('should check ReactNode(s)', function () {
    var propTypes = getPropTypes({el: ReactNode});
    throwsWithMessage(function () {
      runPropTypes(propTypes, {el: true});
    }, '[tcomb] Invalid prop "el" supplied to <diplayName>, should be a ReactNode.\n\nDetected errors (1):\n\n 1. Invalid value true supplied to ReactNode\n\n');
    doesNotThrow(function () {
      runPropTypes(propTypes, {el: 'a'});
    });
    doesNotThrow(function () {
      runPropTypes(propTypes, {el: 1});
    });
    doesNotThrow(function () {
      runPropTypes(propTypes, {el: React.createElement('div')});
    });
    doesNotThrow(function () {
      runPropTypes(propTypes, {el: ['a', React.createElement('div')]});
    });
    doesNotThrow(function () {
      runPropTypes(propTypes, {el: [1, React.createElement('div')]});
    });
    doesNotThrow(function () {
      runPropTypes(propTypes, {el: [React.createElement('div'), React.createElement('a')]});
    });
  });

});
