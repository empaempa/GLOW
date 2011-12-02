#!/usr/bin/env python

try:
	import argparse
	ap = 1
except ImportError:
	import optparse
	ap = 0

import os
import tempfile
import sys

COMMON_FILES = [
'GLOW.js',
'core/Context.js',
'core/Compiler.js',
'core/CompiledData.js',
'core/Cache.js',
'core/FBO.js',
'core/Texture.js',
'core/Shader.js',
'core/Elements.js',
'core/Uniform.js',
'core/Attribute.js',
'core/InterleavedAttributes.js'
]

MATH_FILES = [
'extras/math/Float.js',
'extras/math/Int.js',
'extras/math/Vector2.js',
'extras/math/Vector3.js',
'extras/math/Vector4.js',
'extras/math/Matrix3.js',
'extras/math/Matrix4.js',
]

EXTRAS_FILES = [
'extras/math/Float.js',
'extras/math/Int.js',
'extras/math/Vector2.js',
'extras/math/Vector3.js',
'extras/math/Vector4.js',
'extras/math/Matrix3.js',
'extras/math/Matrix4.js',
'extras/geometry/Geometry.js',
'extras/geometry/Cube.js',
'extras/geometry/Plane.js',
'extras/graph/Node.js',
'extras/graph/Camera.js',
'extras/shaders/ShaderUtils.js'
]

THREE_COMPATABILITY_FILES = [
'extras/compatibility/Three.js'
]


def merge(files):

	buffer = []

	for filename in files:
		with open(os.path.join('..', 'src', filename), 'r') as f:
			buffer.append(f.read())

	return "".join(buffer)


def output(text, filename):

	with open(os.path.join(filename), 'w') as f:
		f.write(text)


def compress(text):

	in_tuple = tempfile.mkstemp()
	with os.fdopen(in_tuple[0], 'w') as handle:
		handle.write(text)

	out_tuple = tempfile.mkstemp()

	os.system("java -jar compiler/compiler.jar --language_in=ECMASCRIPT5_STRICT --js %s --js_output_file %s" % (in_tuple[1], out_tuple[1]))

	with os.fdopen(out_tuple[0], 'r') as handle:
		compressed = handle.read()

	os.unlink(in_tuple[1])
	os.unlink(out_tuple[1])

	return compressed


def addHeader(text, endFilename):
	with open(os.path.join('..', 'REVISION'), 'r') as handle:
		revision = handle.read().rstrip()

	return ("// %s r%s - http://github.com/empaempa/GLOW\n" % (endFilename, revision)) + text


def makeDebug(text):
	position = 0
	while True:
		position = text.find("/* DEBUG", position)
		if position == -1:
			break
		text = text[0:position] + text[position+8:]
		position = text.find("*/", position)
		text = text[0:position] + text[position+2:]
	return text


def buildLib(files, debug, unminified, filename):

	text = merge(files)

	if debug:
		text = makeDebug(text)
		filename = filename + 'Debug'

	if filename == "GLOW":
		folder = ''
	else:
		folder = 'custom/'

	filename = filename + '.js'

	print "=" * 40
	print "Compiling", filename
	print "=" * 40

	if not unminified:
		text = compress(text)

	output(addHeader(text, filename), folder + filename)


def buildIncludes(files, filename):

	template = '\t\t<script type="text/javascript" src="../src/%s"></script>'
	text = "\n".join(template % f for f in files)

	output(text, filename + '.js')


def parse_args():

	if ap:
		parser = argparse.ArgumentParser(description='Build and compress GLOW')
		parser.add_argument('--common', help='Build GLOW', action='store_const', const=True)
		parser.add_argument('--core', help='Build GLOW Core', action='store_const', const=True)
		parser.add_argument('--extras', help='Build GLOW Extras', action='store_const', const=True)
		parser.add_argument('--threecompatibility', help='Build GLOW THREE Compatibility', action='store_const', const=True)
		parser.add_argument('--math', help='Build GLOW Math', action='store_const', const=True)
		parser.add_argument('--debug', help='Generate debug versions', action='store_const', const=True, default=False)
		parser.add_argument('--unminified', help='Generate unminified versions', action='store_const', const=True, default=False)
		parser.add_argument('--all', help='Build all GLOW versions', action='store_true')

		args = parser.parse_args()

	else:
		parser = optparse.OptionParser(description='Build and compress GLOW')
		parser.add_option('--common', dest='common', help='Build GLOW', action='store_const', const=True)
		parser.add_option('--core', dest='core', help='Build GLOW Core', action='store_const', const=True)
		parser.add_option('--extras', dest='extras', help='Build GLOW Extras', action='store_const', const=True)
		parser.add_option('--threecompatibility', dest='threecompatibility', help='Build GLOW THREE Compatibility', action='store_const', const=True)
		parser.add_option('--math', dest='math', help='Build GLOW Math', action='store_const', const=True)
		parser.add_option('--debug', dest='debug', help='Generate debug versions', action='store_const', const=True, default=False)
		parser.add_option('--unminified', help='Generate unminified versions', action='store_const', const=True, default=False)
		parser.add_option('--all', dest='all', help='Build all GLOW versions', action='store_true')

		args, remainder = parser.parse_args()

	# If no arguments have been passed, show the help message and exit
	if len(sys.argv) == 1:
		parser.print_help()
		sys.exit(1)

	return args


def main(argv=None):

	args = parse_args()
	debug = args.debug
	unminified = args.unminified

	config = [
	['GLOW', 'includes', COMMON_FILES + EXTRAS_FILES, args.common],
	['GLOWCore', 'includes', COMMON_FILES, args.core],
	['GLOWExtras', 'includes_extras', EXTRAS_FILES, args.extras],
	['GLOWThreeCompatibility', 'includes_extras', THREE_COMPATABILITY_FILES, args.threecompatibility],
	['GLOWCoreMath', 'includes_extras', MATH_FILES, args.math]
	]


	for fname_lib, fname_inc, files, enabled in config:
		if enabled or args.all or unminified:
			buildLib(files, debug, unminified, fname_lib)

if __name__ == "__main__":
	main()

