GIT_TAG:=$(shell git tag --contains HEAD|awk 'END {print}')
GIT_REV:=git-$(shell git rev-parse --short HEAD)
VERSION:=$(if $(GIT_TAG),$(GIT_TAG),$(GIT_REV))
ifeq ($(findstring race,$(BUILD_ARGS)),race)
VERSION:=$(VERSION)-race
endif

.PHONY: all
all: image

.PHONY: image
image:
	docker build -t baetyltech/baetyl.io:$(VERSION) -f Dockerfile .
